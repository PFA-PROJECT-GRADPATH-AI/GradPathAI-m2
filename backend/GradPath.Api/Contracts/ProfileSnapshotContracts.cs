namespace GradPath.Api.Contracts;

public record Member1ImportEnvelope(
    string ContractVersion,
    string TargetModule,
    string Schema,
    DateTime ExportedAtUtc,
    ProfileSnapshotV1 Data
);

public record ProfileSnapshotV1(
    Guid StudentId,
    string Degree,
    double Cgpa,
    double CgpaScale,
    int GraduationYear,
    string[] Skills,
    string[] ResearchInterests,
    string[] TargetCountries,
    string TargetIntake,
    string FundingPreference,
    string ConsentVersion,
    DateTime SnapshotGeneratedAtUtc
);
