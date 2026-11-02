using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GradPath.Api.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GradPath.Api.Infrastructure;

public static class SeedDataInitializer
{
    public static async Task InitializeAsync(
        GradPathDbContext dbContext,
        UserManager<IdentityUser> userManager,
        ILogger logger)
    {
        await dbContext.Database.EnsureCreatedAsync();

        // 1. Seed Default Demo Student User
        const string demoEmail = "student@gradpath.ai";
        var existingUser = await userManager.FindByEmailAsync(demoEmail);
        if (existingUser == null)
        {
            var user = new IdentityUser
            {
                UserName = demoEmail,
                Email = demoEmail,
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(user, "GradPath2026!");
            if (result.Succeeded)
            {
                logger.LogInformation("Auth.UserSeeded Email={Email}", demoEmail);
            }
            else
            {
                logger.LogWarning("Auth.UserSeedFailed Errors={Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }

        // 2. Seed Universities, Programs, and Professors if empty
        if (!await dbContext.Universities.AnyAsync())
        {
            logger.LogInformation("Database.SeedingCatalog Initializing 6 curated universities and professors...");

            var checkedAt = DateTime.UtcNow.AddHours(-12);

            // 1. TU Munich (Germany)
            var tum = new University
            {
                Id = Uuid7.NewGuid(),
                Name = "Technical University of Munich (TUM)",
                Domain = "tum.de",
                Country = "Germany",
                WebUrl = "https://www.tum.de/en/",
                SourceAllowlisted = true,
                CreatedAtUtc = DateTime.UtcNow
            };
            var tumProg = new ProgramOffer
            {
                Id = Uuid7.NewGuid(),
                UniversityId = tum.Id,
                Name = "M.Sc. Robotics, Cognition, Intelligence",
                Degree = "Master of Science",
                Department = "Department of Computer Science & Engineering",
                MinCgpa = 3.20,
                RequiredIelts = 6.5,
                ResearchKeywords = "Robotics, Computer Vision, Autonomous Systems, Edge AI, Embedded ML",
                FundingStatus = "Verified DAAD / Lab Assistantship (HiWi available)",
                SourceUrl = "https://www.tum.de/en/studies/degree-programs/detail/robotics-cognition-intelligence-master-of-science-msc",
                CheckedAtUtc = checkedAt
            };
            var tumProf = new Professor
            {
                Id = Uuid7.NewGuid(),
                UniversityId = tum.Id,
                ProgramOfferId = tumProg.Id,
                Name = "Prof. Dr. Daniel Cremers",
                Title = "Chair of Computer Vision & Artificial Intelligence",
                Department = "Informatics & Mathematics",
                ResearchArea = "Mathematical Image Analysis, SLAM, 3D Deep Learning",
                ResearchKeywords = "Computer Vision, SLAM, Deep Learning, Edge AI, Autonomous Systems",
                AcceptingStudents = true,
                ProfileUrl = "https://cvg.cit.tum.de/members/cremers",
                LabUrl = "https://cvg.cit.tum.de/",
                CheckedAtUtc = checkedAt
            };

            // 2. ETH Zurich (Switzerland)
            var ethz = new University
            {
                Id = Uuid7.NewGuid(),
                Name = "ETH Zurich",
                Domain = "ethz.ch",
                Country = "Switzerland",
                WebUrl = "https://ethz.ch/en.html",
                SourceAllowlisted = true,
                CreatedAtUtc = DateTime.UtcNow
            };
            var ethProg = new ProgramOffer
            {
                Id = Uuid7.NewGuid(),
                UniversityId = ethz.Id,
                Name = "Master in Computer Science (Machine Intelligence)",
                Degree = "Master of Science",
                Department = "Department of Computer Science (D-INFK)",
                MinCgpa = 3.60,
                RequiredIelts = 7.0,
                ResearchKeywords = "Machine Intelligence, Generative AI, Robotics, Computer Vision",
                FundingStatus = "Excellence Scholarship & Opportunity Programme (ESOP)",
                SourceUrl = "https://inf.ethz.ch/studies/master/master-cs.html",
                CheckedAtUtc = checkedAt
            };
            var ethProf = new Professor
            {
                Id = Uuid7.NewGuid(),
                UniversityId = ethz.Id,
                ProgramOfferId = ethProg.Id,
                Name = "Prof. Dr. Luc Van Gool",
                Title = "Head of Computer Vision Lab (CVL)",
                Department = "Information Technology and Electrical Engineering",
                ResearchArea = "2D/3D Object Recognition, Neural Rendering, Autonomous Driving",
                ResearchKeywords = "Computer Vision, Deep Learning, Autonomous Systems, PyTorch",
                AcceptingStudents = true,
                ProfileUrl = "https://vision.ee.ethz.ch/people-details.OTkyNTM=.TGlzdC8zMjEyLC0xOTcxNDY1MTIz.html",
                LabUrl = "https://vision.ee.ethz.ch/",
                CheckedAtUtc = checkedAt
            };

            // 3. University of Oxford (United Kingdom)
            var oxford = new University
            {
                Id = Uuid7.NewGuid(),
                Name = "University of Oxford",
                Domain = "ox.ac.uk",
                Country = "United Kingdom",
                WebUrl = "https://www.ox.ac.uk/",
                SourceAllowlisted = true,
                CreatedAtUtc = DateTime.UtcNow
            };
            var oxProg = new ProgramOffer
            {
                Id = Uuid7.NewGuid(),
                UniversityId = oxford.Id,
                Name = "MSc in Advanced Computer Science",
                Degree = "Master of Science",
                Department = "Department of Computer Science",
                MinCgpa = 3.70,
                RequiredIelts = 7.5,
                ResearchKeywords = "Deep Learning, Multi-modal Learning, Video Understanding, Foundation Models",
                FundingStatus = "Clarendon Fund & Departmental Research Studentship",
                SourceUrl = "https://www.ox.ac.uk/admissions/graduate/courses/msc-advanced-computer-science",
                CheckedAtUtc = checkedAt
            };
            var oxProf = new Professor
            {
                Id = Uuid7.NewGuid(),
                UniversityId = oxford.Id,
                ProgramOfferId = oxProg.Id,
                Name = "Prof. Andrew Zisserman",
                Title = "Professor of Computer Vision Engineering",
                Department = "Engineering Science & Visual Geometry Group (VGG)",
                ResearchArea = "Machine Learning for Vision, Video Understanding, Multi-modal AI",
                ResearchKeywords = "Computer Vision, Deep Learning, PyTorch, Video Understanding",
                AcceptingStudents = true,
                ProfileUrl = "https://www.robots.ox.ac.uk/~az/",
                LabUrl = "https://www.robots.ox.ac.uk/~vgg/",
                CheckedAtUtc = checkedAt
            };

            // 4. Massachusetts Institute of Technology (USA)
            var mit = new University
            {
                Id = Uuid7.NewGuid(),
                Name = "Massachusetts Institute of Technology (MIT)",
                Domain = "mit.edu",
                Country = "United States",
                WebUrl = "https://www.mit.edu/",
                SourceAllowlisted = true,
                CreatedAtUtc = DateTime.UtcNow
            };
            var mitProg = new ProgramOffer
            {
                Id = Uuid7.NewGuid(),
                UniversityId = mit.Id,
                Name = "Master of Science in EECS (AI & Decision-Making)",
                Degree = "Master of Science",
                Department = "Electrical Engineering and Computer Science (CSAIL)",
                MinCgpa = 3.80,
                RequiredIelts = 7.5,
                ResearchKeywords = "Computer Vision, Embodied AI, Foundation Models, Robotics",
                FundingStatus = "Full Research Assistantship (RA) + Tuition Remission + Stipend",
                SourceUrl = "https://www.eecs.mit.edu/academics/graduate-programs/",
                CheckedAtUtc = checkedAt
            };
            var mitProf = new Professor
            {
                Id = Uuid7.NewGuid(),
                UniversityId = mit.Id,
                ProgramOfferId = mitProg.Id,
                Name = "Prof. Antonio Torralba",
                Title = "Delta Electronics Professor of EECS",
                Department = "CSAIL & EECS",
                ResearchArea = "Computer Vision, Machine Perception, Generative Modeling",
                ResearchKeywords = "Computer Vision, Deep Learning, Foundation Models, PyTorch, ROS",
                AcceptingStudents = true,
                ProfileUrl = "https://groups.csail.mit.edu/vision/torralbalab/",
                LabUrl = "https://groups.csail.mit.edu/vision/",
                CheckedAtUtc = checkedAt
            };

            // 5. University of Waterloo (Canada)
            var waterloo = new University
            {
                Id = Uuid7.NewGuid(),
                Name = "University of Waterloo",
                Domain = "uwaterloo.ca",
                Country = "Canada",
                WebUrl = "https://uwaterloo.ca/",
                SourceAllowlisted = true,
                CreatedAtUtc = DateTime.UtcNow
            };
            var watProg = new ProgramOffer
            {
                Id = Uuid7.NewGuid(),
                UniversityId = waterloo.Id,
                Name = "MMath in Computer Science (Artificial Intelligence)",
                Degree = "Master of Mathematics",
                Department = "David R. Cheriton School of Computer Science",
                MinCgpa = 3.40,
                RequiredIelts = 7.0,
                ResearchKeywords = "Operational AI, Edge AI, TinyML, Medical Imaging, Deep Learning",
                FundingStatus = "Graduate Research Studentship (GRS) + Teaching Assistantship",
                SourceUrl = "https://uwaterloo.ca/computer-science/graduate-studies/programs/master-mathematics-mmath-computer-science",
                CheckedAtUtc = checkedAt
            };
            var watProf = new Professor
            {
                Id = Uuid7.NewGuid(),
                UniversityId = waterloo.Id,
                ProgramOfferId = watProg.Id,
                Name = "Prof. Alexander Wong",
                Title = "Canada Research Chair in AI and Medical Imaging",
                Department = "Systems Design Engineering & Waterloo AI Institute",
                ResearchArea = "Operational AI, Embedded ML, Efficient Deep Neural Networks, TinyML",
                ResearchKeywords = "Edge AI, Embedded ML, Deep Learning, C++, Python, TinyML",
                AcceptingStudents = true,
                ProfileUrl = "https://uwaterloo.ca/vision-image-processing-lab/people-profiles/alexander-wong",
                LabUrl = "https://uwaterloo.ca/vision-image-processing-lab/",
                CheckedAtUtc = checkedAt
            };

            // 6. University of Toronto (Canada)
            var utoronto = new University
            {
                Id = Uuid7.NewGuid(),
                Name = "University of Toronto",
                Domain = "utoronto.ca",
                Country = "Canada",
                WebUrl = "https://www.utoronto.ca/",
                SourceAllowlisted = true,
                CreatedAtUtc = DateTime.UtcNow
            };
            var uoftProg = new ProgramOffer
            {
                Id = Uuid7.NewGuid(),
                UniversityId = utoronto.Id,
                Name = "Master of Science in Applied Computing (MScAC - AI Concentration)",
                Degree = "Master of Science",
                Department = "Department of Computer Science & Vector Institute",
                MinCgpa = 3.50,
                RequiredIelts = 7.0,
                ResearchKeywords = "Neural Graphics, 3D Computer Vision, Autonomous Vehicles, Generative AI",
                FundingStatus = "Paid 8-Month Applied Applied Research Internship (~$55,000)",
                SourceUrl = "https://web.cs.toronto.ca/graduate/mscac",
                CheckedAtUtc = checkedAt
            };
            var uoftProf = new Professor
            {
                Id = Uuid7.NewGuid(),
                UniversityId = utoronto.Id,
                ProgramOfferId = uoftProg.Id,
                Name = "Prof. Sanja Fidler",
                Title = "Associate Professor & VP of AI Research",
                Department = "Computer Science & Vector Institute",
                ResearchArea = "3D Computer Vision, Neural Reconstruction, Interactive Graphics",
                ResearchKeywords = "Computer Vision, Deep Learning, 3D Reconstruction, PyTorch",
                AcceptingStudents = true,
                ProfileUrl = "https://www.cs.toronto.edu/~fidler/",
                LabUrl = "https://vectorinstitute.ai/research/faculty/sanja-fidler/",
                CheckedAtUtc = checkedAt
            };

            dbContext.Universities.AddRange(tum, ethz, oxford, mit, waterloo, utoronto);
            dbContext.Programs.AddRange(tumProg, ethProg, oxProg, mitProg, watProg, uoftProg);
            dbContext.Professors.AddRange(tumProf, ethProf, oxProf, mitProf, watProf, uoftProf);

            await dbContext.SaveChangesAsync();
            logger.LogInformation("Database.CatalogSeeded Successfully seeded 6 universities, programs, and professors.");
        }
    }
}
