using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GradPath.Api.Domain;
using GradPath.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GradPath.Api.Services;

public interface ILeadApprovalService
{
    Task<ApprovedLead> ApproveLeadAsync(ApproveLeadRequest request);
    Task<List<ApprovedLead>> GetApprovedLeadsForStudentAsync(string studentId);
}

public class LeadApprovalService : ILeadApprovalService
{
    private readonly GradPathDbContext _dbContext;
    private readonly ILogger<LeadApprovalService> _logger;

    public LeadApprovalService(GradPathDbContext dbContext, ILogger<LeadApprovalService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<ApprovedLead> ApproveLeadAsync(ApproveLeadRequest request)
    {
        var prof = await _dbContext.Professors
            .Include(p => p.University)
            .Include(p => p.ProgramOffer)
            .FirstOrDefaultAsync(p => p.Id == request.ProfessorId);

        if (prof == null)
        {
            throw new KeyNotFoundException($"Professor with ID '{request.ProfessorId}' not found.");
        }

        var lead = new ApprovedLead
        {
            Id = Uuid7.NewGuid(), // UUIDv7
            StudentId = request.StudentId,
            StudentEmail = request.StudentEmail,
            ProfessorId = prof.Id,
            ProfessorName = prof.Name,
            UniversityName = prof.University?.Name ?? "Unknown University",
            ProgramName = prof.ProgramOffer?.Name ?? "Graduate Program",
            FitScore = 95.0, // High-confidence vetted lead
            EligibilityStatus = EligibilityStatus.ELIGIBLE,
            MatchReasoning = $"Approved by student ({request.StudentEmail}). Lab: {prof.LabUrl}",
            Status = "Approved",
            ApprovedAtUtc = DateTime.UtcNow
        };

        _dbContext.ApprovedLeads.Add(lead);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation(
            "Lead.Approved LeadId={LeadId} StudentId={StudentId} ProfessorId={ProfId}",
            lead.Id,
            lead.StudentId,
            lead.ProfessorId);

        return lead;
    }

    public async Task<List<ApprovedLead>> GetApprovedLeadsForStudentAsync(string studentId)
    {
        return await _dbContext.ApprovedLeads
            .Where(l => l.StudentId == studentId)
            .OrderByDescending(l => l.ApprovedAtUtc)
            .ToListAsync();
    }
}
