using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using GradPath.Api.Domain;

namespace GradPath.Api.Strategies;

public interface IMatchScoringStrategy
{
    string StrategyName { get; }
    string FormulaVersion { get; }

    (MatchScoreBreakdown Breakdown, List<string> MatchedKeywords, List<string> Explanations) ScoreMatch(
        StudentProfileCriteria profile,
        Professor professor,
        ProgramOffer program,
        University university);
}

/// <summary>
/// Implements the Chapter 4.1.2 weighted fit formula:
/// S = 0.40 * R + 0.25 * K + 0.15 * P + 0.10 * F + 0.10 * I
/// with intelligent semantic n-gram matching and tech stack synergy mapping.
/// </summary>
public class WeightedResearchFitStrategy : IMatchScoringStrategy
{
    public string StrategyName => "WeightedFormulaScoringStrategy";
    public string FormulaVersion => "v1-Weighted";

    // Tech stack to research domain synergy dictionary
    private static readonly Dictionary<string, string[]> SkillToDomainSynergies = new(StringComparer.OrdinalIgnoreCase)
    {
        { "pytorch", new[] { "deep learning", "computer vision", "neural", "perception", "representation learning", "generative ai", "ai" } },
        { "tensorflow", new[] { "deep learning", "machine learning", "neural", "computer vision", "ai" } },
        { "python", new[] { "machine learning", "deep learning", "computer vision", "data science", "ai", "artificial intelligence" } },
        { "ros", new[] { "robotics", "autonomous systems", "slam", "autonomous driving", "perception" } },
        { "c++", new[] { "slam", "robotics", "computer vision", "embedded", "autonomous systems", "3d", "tinyml" } },
        { "embedded ml", new[] { "edge ai", "tinyml", "embedded", "robotics", "operational ai" } },
        { "tinyml", new[] { "edge ai", "embedded ml", "operational ai", "efficient deep neural networks" } },
        { "cuda", new[] { "deep learning", "high performance computing", "neural rendering", "gpu" } }
    };

    public (MatchScoreBreakdown Breakdown, List<string> MatchedKeywords, List<string> Explanations) ScoreMatch(
        StudentProfileCriteria profile,
        Professor professor,
        ProgramOffer program,
        University university)
    {
        var explanations = new List<string>();
        var allMatchedKeywords = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // 1. R: Research Alignment (0-100), Weight = 0.40
        // Compares student's research interests with professor's research area, title, department & program
        var studentInterests = ExtractPhrases(profile.ResearchInterests);
        var profCorpus = $"{professor.Name} {professor.Title} {professor.Department} {professor.ResearchArea} {professor.ResearchKeywords} {program.Name} {program.ResearchKeywords}";
        
        int interestMatchCount = 0;
        var matchedInterests = new List<string>();

        foreach (var interest in studentInterests)
        {
            if (ContainsIgnoreCase(profCorpus, interest))
            {
                interestMatchCount++;
                matchedInterests.Add(interest);
                allMatchedKeywords.Add(interest);
            }
            else
            {
                // Sub-word / partial check (e.g. "Vision" in "Computer Vision", "Robotics" in "Robotic Systems")
                var interestWords = interest.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                                            .Where(w => w.Length > 2 && !IsStopWord(w));
                bool subMatch = interestWords.Any(w => ContainsIgnoreCase(profCorpus, w));
                if (subMatch)
                {
                    interestMatchCount++;
                    matchedInterests.Add(interest);
                    allMatchedKeywords.Add(interest);
                }
            }
        }

        double rScore;
        if (studentInterests.Count > 0)
        {
            double ratio = (double)interestMatchCount / studentInterests.Count;
            rScore = Math.Min(100.0, Math.Max(20.0, ratio * 100.0));
        }
        else
        {
            rScore = 50.0;
        }

        // Active recruitment bonus
        if (professor.AcceptingStudents)
        {
            rScore = Math.Min(100.0, rScore + 5.0);
        }

        if (matchedInterests.Count > 0)
        {
            explanations.Add($"Research Alignment (R={rScore:F0}%): High alignment on '{string.Join(", ", matchedInterests.Take(3))}' ({professor.ResearchArea}).");
        }
        else
        {
            explanations.Add($"Research Alignment (R={rScore:F0}%): Found broader department focus in {professor.Department}.");
        }

        // 2. K: Keyword & Skill Overlap (0-100), Weight = 0.25
        var studentSkills = ExtractPhrases(profile.Skills);
        var profKeywords = ExtractPhrases(professor.ResearchKeywords);
        var matchedSkills = new List<string>();

        foreach (var skill in studentSkills)
        {
            // Direct skill/keyword match
            if (profKeywords.Any(pk => ContainsIgnoreCase(pk, skill) || ContainsIgnoreCase(skill, pk)) ||
                ContainsIgnoreCase(profCorpus, skill))
            {
                matchedSkills.Add(skill);
                allMatchedKeywords.Add(skill);
                continue;
            }

            // Tech stack synergy check (e.g. PyTorch -> Deep Learning)
            if (SkillToDomainSynergies.TryGetValue(skill.Trim(), out var targetDomains))
            {
                if (targetDomains.Any(domain => ContainsIgnoreCase(profCorpus, domain)))
                {
                    matchedSkills.Add($"{skill} (synergy)");
                    allMatchedKeywords.Add(skill);
                }
            }
        }

        double kScore;
        if (studentSkills.Count > 0)
        {
            double matchRatio = (double)matchedSkills.Count / studentSkills.Count;
            kScore = Math.Min(100.0, Math.Round(matchRatio * 100.0, 1));
            // Floor at 30% if general CS/AI domain intersects
            if (kScore == 0 && rScore > 40) kScore = 40.0;
        }
        else
        {
            kScore = 50.0;
        }

        if (matchedSkills.Count > 0)
        {
            explanations.Add($"Keyword Overlap (K={kScore:F0}%): Matched {matchedSkills.Count} student technical skills: {string.Join(", ", matchedSkills)}.");
        }
        else
        {
            explanations.Add($"Keyword Overlap (K={kScore:F0}%): General domain intersection without direct keyword matches.");
        }

        // 3. P: Academic Profile Strength (0-100), Weight = 0.15
        double pScore;
        if (profile.Cgpa >= program.MinCgpa)
        {
            double surplus = profile.Cgpa - program.MinCgpa;
            pScore = Math.Min(100.0, 75.0 + (surplus * 50.0));
            explanations.Add($"Academic Strength (P={pScore:F0}%): CGPA {profile.Cgpa:F2} exceeds requirement of {program.MinCgpa:F2}.");
        }
        else
        {
            double deficit = program.MinCgpa - profile.Cgpa;
            pScore = Math.Max(20.0, 60.0 - (deficit * 80.0));
            explanations.Add($"Academic Strength (P={pScore:F0}%): CGPA {profile.Cgpa:F2} is below {program.MinCgpa:F2}.");
        }

        // 4. F: Funding Alignment (0-100), Weight = 0.10
        double fScore = 60.0;
        bool hasVerifiedFunding = !string.IsNullOrEmpty(program.FundingStatus) &&
            (program.FundingStatus.Contains("DAAD", StringComparison.OrdinalIgnoreCase) ||
             program.FundingStatus.Contains("Assistantship", StringComparison.OrdinalIgnoreCase) ||
             program.FundingStatus.Contains("Full", StringComparison.OrdinalIgnoreCase) ||
             program.FundingStatus.Contains("Scholarship", StringComparison.OrdinalIgnoreCase) ||
             program.FundingStatus.Contains("Stipend", StringComparison.OrdinalIgnoreCase) ||
             program.FundingStatus.Contains("Internship", StringComparison.OrdinalIgnoreCase));

        if (profile.RequiresFunding)
        {
            if (hasVerifiedFunding)
            {
                fScore = 100.0;
                explanations.Add($"Funding Fit (F=100%): Verified funding support: '{program.FundingStatus}'.");
            }
            else
            {
                fScore = 40.0;
                explanations.Add($"Funding Fit (F=40%): Program funding requires individual faculty inquiry.");
            }
        }
        else
        {
            fScore = 90.0;
            explanations.Add($"Funding Fit (F=90%): Self-directed funding preference accommodated.");
        }

        // 5. I: Institution & Country Fit (0-100), Weight = 0.10
        double iScore = 70.0;
        var targetCountries = profile.TargetCountries.Count > 0
            ? profile.TargetCountries
            : new List<string> { profile.TargetCountry };
        if (targetCountries.Any(country =>
                university.Country.Equals(country, StringComparison.OrdinalIgnoreCase)))
        {
            iScore = 100.0;
            explanations.Add($"Institution Fit (I=100%): Located in preferred country '{university.Country}'.");
        }
        else if (targetCountries.Count == 0 ||
                 targetCountries.Any(country => string.IsNullOrWhiteSpace(country) ||
                    country.Equals("Any", StringComparison.OrdinalIgnoreCase)))
        {
            iScore = 85.0;
            explanations.Add($"Institution Fit (I=85%): Worldwide target institution ({university.Country}).");
        }
        else
        {
            iScore = 55.0;
            explanations.Add($"Institution Fit (I=55%): Located in {university.Country} (Targets were {string.Join(", ", targetCountries)}).");
        }

        // Weighted Total: S = 0.40R + 0.25K + 0.15P + 0.10F + 0.10I
        double totalScore = (0.40 * rScore) + (0.25 * kScore) + (0.15 * pScore) + (0.10 * fScore) + (0.10 * iScore);

        var breakdown = new MatchScoreBreakdown
        {
            ResearchAlignmentScore = Math.Round(rScore, 1),
            KeywordOverlapScore = Math.Round(kScore, 1),
            AcademicProfileScore = Math.Round(pScore, 1),
            FundingAlignmentScore = Math.Round(fScore, 1),
            InstitutionFitScore = Math.Round(iScore, 1),
            TotalWeightedScore = Math.Round(totalScore, 1)
        };

        return (breakdown, allMatchedKeywords.ToList(), explanations);
    }

    private static List<string> ExtractPhrases(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return new List<string>();
        return input.Split(new[] { ',', ';', '/', '|', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim())
                    .Where(s => s.Length > 1)
                    .ToList();
    }

    private static bool ContainsIgnoreCase(string source, string target)
    {
        if (string.IsNullOrEmpty(source) || string.IsNullOrEmpty(target)) return false;
        return source.IndexOf(target, StringComparison.OrdinalIgnoreCase) >= 0;
    }

    private static bool IsStopWord(string word)
    {
        var stops = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "and", "the", "for", "with", "from", "into", "over", "system", "systems" };
        return stops.Contains(word);
    }
}
