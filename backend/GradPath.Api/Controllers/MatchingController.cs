using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Text.Json;
using GradPath.Api.Contracts;
using GradPath.Api.Domain;
using GradPath.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GradPath.Api.Controllers;

[ApiController]
[Route("api/v1")]
public class MatchingController : ControllerBase
{
    private readonly IMatchingService _matchingService;
    private readonly ILeadApprovalService _leadApprovalService;

    public MatchingController(
        IMatchingService matchingService,
        ILeadApprovalService leadApprovalService)
    {
        _matchingService = matchingService;
        _leadApprovalService = leadApprovalService;
    }

    [HttpPost("matches/run")]
    public async Task<ActionResult<List<MatchCandidateResult>>> RunMatch([FromBody] StudentProfileCriteria profile)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "demo-student-id";
        var results = await _matchingService.RunMatchingAsync(profile, studentId);
        return Ok(results);
    }

    [HttpPost("recommendations/import-profile")]
    [Consumes("application/json")]
    public async Task<IActionResult> ImportProfile([FromBody] Member1ImportEnvelope? envelope)
    {
        return await ImportSnapshotAsync(envelope);
    }

    [HttpPost("recommendations/import-profile/file")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ImportProfileFile([FromForm] IFormFile? file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { detail = "A non-empty ProfileSnapshot JSON file is required." });

        try
        {
            await using var stream = file.OpenReadStream();
            var envelope = await JsonSerializer.DeserializeAsync<Member1ImportEnvelope>(
                stream,
                new JsonSerializerOptions(JsonSerializerDefaults.Web));
            return await ImportSnapshotAsync(envelope);
        }
        catch (JsonException)
        {
            return BadRequest(new { detail = "The uploaded file is not valid JSON." });
        }
    }

    private async Task<IActionResult> ImportSnapshotAsync(Member1ImportEnvelope? envelope)
    {
        if (envelope?.Data is null)
            return BadRequest(new { detail = "Invalid contract payload: Data is required." });

        if (!string.Equals(envelope.ContractVersion, "v1.0", StringComparison.Ordinal) ||
            !string.Equals(envelope.TargetModule, "Member2-RecommendationEngine", StringComparison.Ordinal) ||
            !string.Equals(envelope.Schema,
                "https://schemas.gradpath.ai/contracts/member2/profile-snapshot-v1.json",
                StringComparison.Ordinal))
        {
            return BadRequest(new { detail = "Unsupported ProfileSnapshot contract metadata." });
        }

        var snapshot = envelope.Data;
        if (snapshot.CgpaScale <= 0 ||
            snapshot.Cgpa <= 0 ||
            snapshot.Cgpa > snapshot.CgpaScale)
        {
            return BadRequest(new { detail = "Invalid CGPA range in imported snapshot." });
        }

        if (snapshot.Skills is null ||
            snapshot.ResearchInterests is null ||
            snapshot.TargetCountries is null ||
            snapshot.TargetCountries.Length == 0 ||
            string.IsNullOrWhiteSpace(snapshot.Degree) ||
            string.IsNullOrWhiteSpace(snapshot.TargetIntake) ||
            string.IsNullOrWhiteSpace(snapshot.FundingPreference) ||
            string.IsNullOrWhiteSpace(snapshot.ConsentVersion))
        {
            return BadRequest(new { detail = "Imported snapshot is missing required profile fields." });
        }

        var profile = new StudentProfileCriteria
        {
            Cgpa = snapshot.Cgpa / snapshot.CgpaScale * 4.0,
            Degree = snapshot.Degree,
            Skills = string.Join(", ", snapshot.Skills),
            ResearchInterests = string.Join(", ", snapshot.ResearchInterests),
            TargetCountries = snapshot.TargetCountries.Where(country => !string.IsNullOrWhiteSpace(country)).ToList(),
            TargetCountry = snapshot.TargetCountries.FirstOrDefault(country => !string.IsNullOrWhiteSpace(country)) ?? "Any",
            RequiresFunding = !snapshot.FundingPreference.Equals("Self-funded", StringComparison.OrdinalIgnoreCase)
        };

        var results = await _matchingService.RunMatchingAsync(profile, snapshot.StudentId.ToString());
        return Ok(new
        {
            message = "Profile successfully imported into Recommendation Engine.",
            studentId = snapshot.StudentId,
            matchedUniversitiesCount = results.Select(result => result.UniversityId).Distinct().Count(),
            results
        });
    }

    [HttpPost("shortlist/{leadId}/approve")]
    public async Task<ActionResult<ApprovedLead>> ApproveLeadById(
        [FromRoute] Guid leadId,
        [FromBody] ApproveLeadRequest request)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? request.StudentId ?? "demo-student-id";
        var studentEmail = User.FindFirstValue(ClaimTypes.Email) ?? request.StudentEmail ?? "student@gradpath.ai";

        var approvedRequest = request with
        {
            StudentId = studentId,
            StudentEmail = studentEmail
        };

        var lead = await _leadApprovalService.ApproveLeadAsync(approvedRequest);
        return Ok(lead);
    }

    [HttpPost("shortlist/approve")]
    public async Task<ActionResult<ApprovedLead>> ApproveLead([FromBody] ApproveLeadRequest request)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? request.StudentId ?? "demo-student-id";
        var studentEmail = User.FindFirstValue(ClaimTypes.Email) ?? request.StudentEmail ?? "student@gradpath.ai";

        var approvedRequest = request with
        {
            StudentId = studentId,
            StudentEmail = studentEmail
        };

        var lead = await _leadApprovalService.ApproveLeadAsync(approvedRequest);
        return Ok(lead);
    }

    [HttpGet("leads/approved")]
    public async Task<ActionResult<List<ApprovedLead>>> GetApprovedLeads()
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "demo-student-id";
        var leads = await _leadApprovalService.GetApprovedLeadsForStudentAsync(studentId);
        return Ok(leads);
    }
}
