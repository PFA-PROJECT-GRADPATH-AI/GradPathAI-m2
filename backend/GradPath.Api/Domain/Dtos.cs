using System;
using System.Collections.Generic;

namespace GradPath.Api.Domain;

public record RegisterRequest(string Email, string Password, string FullName);
public record LoginRequest(string Email, string Password);
public record AuthUserResponse(string Id, string Email, string FullName);

public class StudentProfileCriteria
{
    public double Cgpa { get; set; } = 3.65;
    public double? IeltsScore { get; set; } = 7.5;
    public string Degree { get; set; } = "Master of Science";
    public string TargetCountry { get; set; } = "Germany";
    public List<string> TargetCountries { get; set; } = new();
    public string ResearchInterests { get; set; } = "Deep Learning, Computer Vision, Edge AI, Autonomous Systems";
    public string Skills { get; set; } = "Python, PyTorch, C++, ROS, Embedded ML";
    public bool RequiresFunding { get; set; } = true;
}

public class MatchScoreBreakdown
{
    public double ResearchAlignmentScore { get; set; }  // R (weight 0.40)
    public double KeywordOverlapScore { get; set; }      // K (weight 0.25)
    public double AcademicProfileScore { get; set; }     // P (weight 0.15)
    public double FundingAlignmentScore { get; set; }    // F (weight 0.10)
    public double InstitutionFitScore { get; set; }      // I (weight 0.10)
    public double TotalWeightedScore { get; set; }       // S
}

public class MatchCandidateResult
{
    public Guid ProfessorId { get; set; }
    public string ProfessorName { get; set; } = string.Empty;
    public string ProfessorTitle { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string ResearchArea { get; set; } = string.Empty;
    public List<string> ResearchKeywords { get; set; } = new();
    public string ProfileUrl { get; set; } = string.Empty;
    public string LabUrl { get; set; } = string.Empty;

    public Guid UniversityId { get; set; }
    public string UniversityName { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;

    public Guid ProgramOfferId { get; set; }
    public string ProgramName { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public double MinCgpa { get; set; }
    public double RequiredIelts { get; set; }
    public string FundingStatus { get; set; } = string.Empty;
    public string SourceUrl { get; set; } = string.Empty;
    public DateTime CheckedAtUtc { get; set; }

    public EligibilityStatus Eligibility { get; set; }
    public List<string> EligibilityNotes { get; set; } = new();

    public MatchScoreBreakdown ScoreBreakdown { get; set; } = new();
    public List<string> MatchedKeywords { get; set; } = new();
    public List<string> Explanations { get; set; } = new();
}

public record ApproveLeadRequest(
    Guid ProfessorId,
    string StudentId,
    string StudentEmail
);
