using System.Collections.Generic;
using GradPath.Api.Domain;

namespace GradPath.Api.Services;

public record EligibilityEvaluationResult(
    EligibilityStatus Status,
    List<string> Notes
);

public interface IEligibilityEngine
{
    EligibilityEvaluationResult Evaluate(StudentProfileCriteria profile, ProgramOffer program);
}

public class EligibilityEngine : IEligibilityEngine
{
    public EligibilityEvaluationResult Evaluate(StudentProfileCriteria profile, ProgramOffer program)
    {
        var notes = new List<string>();
        bool hardFailure = false;
        bool needsReview = false;

        // 1. CGPA Hard Cutoff Check
        if (profile.Cgpa < program.MinCgpa)
        {
            hardFailure = true;
            notes.Add($"CGPA {profile.Cgpa:F2} is below minimum requirement of {program.MinCgpa:F2}.");
        }
        else
        {
            notes.Add($"CGPA {profile.Cgpa:F2} meets/exceeds requirement of {program.MinCgpa:F2}.");
        }

        // 2. IELTS / Language Check
        if (!profile.IeltsScore.HasValue)
        {
            needsReview = true;
            notes.Add($"English proficiency (IELTS) score not provided; requires review against {program.RequiredIelts:F1} min.");
        }
        else if (profile.IeltsScore.Value < program.RequiredIelts)
        {
            // If slightly below (within 0.5), needs review (conditional admission/waiver); if far below, ineligible
            if (program.RequiredIelts - profile.IeltsScore.Value <= 0.5)
            {
                needsReview = true;
                notes.Add($"IELTS {profile.IeltsScore.Value:F1} is marginally below {program.RequiredIelts:F1} (conditional waiver review possible).");
            }
            else
            {
                hardFailure = true;
                notes.Add($"IELTS {profile.IeltsScore.Value:F1} fails minimum cutoff of {program.RequiredIelts:F1}.");
            }
        }
        else
        {
            notes.Add($"IELTS {profile.IeltsScore.Value:F1} satisfies minimum requirement ({program.RequiredIelts:F1}).");
        }

        // 3. Degree Target Alignment
        if (!string.IsNullOrWhiteSpace(profile.Degree) && !string.IsNullOrWhiteSpace(program.Degree))
        {
            if (program.Degree.Contains(profile.Degree, System.StringComparison.OrdinalIgnoreCase) ||
                profile.Degree.Contains("Master", System.StringComparison.OrdinalIgnoreCase))
            {
                notes.Add($"Degree type '{profile.Degree}' aligns with program degree '{program.Degree}'.");
            }
            else
            {
                needsReview = true;
                notes.Add($"Degree prerequisite check required for transition from '{profile.Degree}' to '{program.Degree}'.");
            }
        }

        if (hardFailure)
        {
            return new EligibilityEvaluationResult(EligibilityStatus.INELIGIBLE, notes);
        }

        if (needsReview)
        {
            return new EligibilityEvaluationResult(EligibilityStatus.NEEDS_REVIEW, notes);
        }

        return new EligibilityEvaluationResult(EligibilityStatus.ELIGIBLE, notes);
    }
}
