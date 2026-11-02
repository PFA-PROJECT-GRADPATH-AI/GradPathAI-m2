using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradPath.Api.Domain;
using GradPath.Api.Infrastructure;
using GradPath.Api.Strategies;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GradPath.Api.Services;

public interface IMatchingService
{
    Task<List<MatchCandidateResult>> RunMatchingAsync(StudentProfileCriteria profile, string studentId);
}

public class MatchingService : IMatchingService
{
    private readonly GradPathDbContext _dbContext;
    private readonly IEligibilityEngine _eligibilityEngine;
    private readonly IMatchScoringStrategy _scoringStrategy;
    private readonly ILogger<MatchingService> _logger;

    public MatchingService(
        GradPathDbContext dbContext,
        IEligibilityEngine eligibilityEngine,
        IMatchScoringStrategy scoringStrategy,
        ILogger<MatchingService> logger)
    {
        _dbContext = dbContext;
        _eligibilityEngine = eligibilityEngine;
        _scoringStrategy = scoringStrategy;
        _logger = logger;
    }

    public async Task<List<MatchCandidateResult>> RunMatchingAsync(StudentProfileCriteria profile, string studentId)
    {
        var professors = await _dbContext.Professors
            .Include(p => p.University)
            .Include(p => p.ProgramOffer)
            .ToListAsync();

        var results = new List<MatchCandidateResult>();

        foreach (var prof in professors)
        {
            var university = prof.University ?? new University { Name = "Unknown University", Country = "Unknown" };
            var program = prof.ProgramOffer ?? new ProgramOffer
            {
                Name = "General Graduate Studies",
                Degree = profile.Degree,
                MinCgpa = 3.0,
                RequiredIelts = 6.5,
                FundingStatus = "Self-Funded"
            };

            // 1. Evaluate Eligibility
            var eligibility = _eligibilityEngine.Evaluate(profile, program);
            _logger.LogInformation(
                "Eligibility.Assessed StudentId={StudentId} ProgramId={ProgramId} Status={Status}",
                studentId,
                program.Id,
                eligibility.Status);

            // 2. Score Match with Strategy
            var (breakdown, matchedKeywords, explanations) = _scoringStrategy.ScoreMatch(profile, prof, program, university);
            _logger.LogInformation(
                "Match.Scored StudentId={StudentId} ProfessorId={ProfId} Score={Score:F2} FormulaVersion={Ver}",
                studentId,
                prof.Id,
                breakdown.TotalWeightedScore,
                _scoringStrategy.FormulaVersion);

            // Keywords list
            var profKeywords = (prof.ResearchKeywords ?? "")
                .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(k => k.Trim())
                .ToList();

            var candidate = new MatchCandidateResult
            {
                ProfessorId = prof.Id,
                ProfessorName = prof.Name,
                ProfessorTitle = prof.Title,
                Department = prof.Department,
                ResearchArea = prof.ResearchArea,
                ResearchKeywords = profKeywords,
                ProfileUrl = prof.ProfileUrl,
                LabUrl = prof.LabUrl,
                UniversityId = university.Id,
                UniversityName = university.Name,
                Country = university.Country,
                ProgramOfferId = program.Id,
                ProgramName = program.Name,
                Degree = program.Degree,
                MinCgpa = program.MinCgpa,
                RequiredIelts = program.RequiredIelts,
                FundingStatus = program.FundingStatus,
                SourceUrl = program.SourceUrl,
                CheckedAtUtc = program.CheckedAtUtc,
                Eligibility = eligibility.Status,
                EligibilityNotes = eligibility.Notes,
                ScoreBreakdown = breakdown,
                MatchedKeywords = matchedKeywords,
                Explanations = explanations
            };

            results.Add(candidate);
        }

        // Order by TotalWeightedScore descending, with ELIGIBLE prioritized over INELIGIBLE
        return results
            .OrderByDescending(r => r.Eligibility == EligibilityStatus.ELIGIBLE ? 2 : (r.Eligibility == EligibilityStatus.NEEDS_REVIEW ? 1 : 0))
            .ThenByDescending(r => r.ScoreBreakdown.TotalWeightedScore)
            .ToList();
    }
}
