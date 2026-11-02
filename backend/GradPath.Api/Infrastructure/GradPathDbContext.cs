using GradPath.Api.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GradPath.Api.Infrastructure;

public class GradPathDbContext : IdentityDbContext<IdentityUser>
{
    public GradPathDbContext(DbContextOptions<GradPathDbContext> options) : base(options)
    {
    }

    public DbSet<University> Universities => Set<University>();
    public DbSet<ProgramOffer> Programs => Set<ProgramOffer>();
    public DbSet<Professor> Professors => Set<Professor>();
    public DbSet<ApprovedLead> ApprovedLeads => Set<ApprovedLead>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<University>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Name).IsRequired().HasMaxLength(200);
            entity.Property(u => u.Domain).IsRequired().HasMaxLength(100);
            entity.HasIndex(u => u.Domain).IsUnique();
        });

        builder.Entity<ProgramOffer>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
            entity.HasOne(p => p.University)
                  .WithMany(u => u.Programs)
                  .HasForeignKey(p => p.UniversityId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Professor>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
            entity.HasOne(p => p.University)
                  .WithMany(u => u.Professors)
                  .HasForeignKey(p => p.UniversityId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(p => p.ProgramOffer)
                  .WithMany(pr => pr.Professors)
                  .HasForeignKey(p => p.ProgramOfferId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<ApprovedLead>(entity =>
        {
            entity.HasKey(l => l.Id);
            entity.Property(l => l.StudentId).IsRequired();
            entity.Property(l => l.ProfessorName).IsRequired();
            entity.Property(l => l.UniversityName).IsRequired();
        });
    }
}
