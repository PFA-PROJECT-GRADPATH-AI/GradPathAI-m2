using System;
using System.Collections.Generic;

namespace GradPath.Api.Domain;

public class University
{
    public Guid Id { get; set; } = Uuid7.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string WebUrl { get; set; } = string.Empty;
    public bool SourceAllowlisted { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public List<ProgramOffer> Programs { get; set; } = new();
    public List<Professor> Professors { get; set; } = new();
}

public class ProgramOffer
{
    public Guid Id { get; set; } = Uuid7.NewGuid();
    public Guid UniversityId { get; set; }
    public University? University { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Degree { get; set; } = "Master of Science";
    public string Department { get; set; } = string.Empty;
    public double MinCgpa { get; set; } = 3.0;
    public double RequiredIelts { get; set; } = 6.5;
    public string ResearchKeywords { get; set; } = string.Empty;
    public string FundingStatus { get; set; } = "Verified DAAD / Lab Assistantship";
    public string SourceUrl { get; set; } = string.Empty;
    public DateTime CheckedAtUtc { get; set; } = DateTime.UtcNow;

    public List<Professor> Professors { get; set; } = new();
}

public class Professor
{
    public Guid Id { get; set; } = Uuid7.NewGuid();
    public Guid UniversityId { get; set; }
    public University? University { get; set; }

    public Guid? ProgramOfferId { get; set; }
    public ProgramOffer? ProgramOffer { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Title { get; set; } = "Associate Professor";
    public string Department { get; set; } = string.Empty;
    public string ResearchArea { get; set; } = string.Empty;
    public string ResearchKeywords { get; set; } = string.Empty; // Comma-delimited
    public bool AcceptingStudents { get; set; } = true;
    public string ProfileUrl { get; set; } = string.Empty;
    public string LabUrl { get; set; } = string.Empty;
    public DateTime CheckedAtUtc { get; set; } = DateTime.UtcNow;
}

public class ApprovedLead
{
    public Guid Id { get; set; } = Uuid7.NewGuid();
    public string StudentId { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public Guid ProfessorId { get; set; }
    public string ProfessorName { get; set; } = string.Empty;
    public string UniversityName { get; set; } = string.Empty;
    public string ProgramName { get; set; } = string.Empty;
    public double FitScore { get; set; }
    public EligibilityStatus EligibilityStatus { get; set; }
    public string MatchReasoning { get; set; } = string.Empty;
    public string Status { get; set; } = "Approved"; // Approved, InReview, Contacted
    public DateTime ApprovedAtUtc { get; set; } = DateTime.UtcNow;
}
