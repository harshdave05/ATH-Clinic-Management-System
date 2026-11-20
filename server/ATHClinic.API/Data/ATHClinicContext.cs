using System;
using System.Collections.Generic;
using ATHClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ATHClinic.API.Data;

public partial class ATHClinicContext : DbContext
{
    public ATHClinicContext(DbContextOptions<ATHClinicContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Appointment> Appointments { get; set; }

    public virtual DbSet<Doctor> Doctors { get; set; }

    public virtual DbSet<Medicine> Medicines { get; set; }

    public virtual DbSet<Patient> Patients { get; set; }

    public virtual DbSet<Prescription> Prescriptions { get; set; }

    public virtual DbSet<PrescriptionItem> PrescriptionItems { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Visit> Visits { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(e => e.AppointmentId).HasName("PK__Appointm__8ECDFCC243CB5287");

            entity.HasIndex(e => new { e.DoctorId, e.AppointmentDate }, "IX_Appointments_DoctorDate");

            entity.HasIndex(e => e.PatientId, "IX_Appointments_PatientId");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Reason).HasMaxLength(300);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Scheduled");

            entity.HasOne(d => d.Doctor).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.DoctorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Appointments_Doctors");

            entity.HasOne(d => d.Patient).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.PatientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Appointments_Patients");
        });

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.HasKey(e => e.DoctorId).HasName("PK__Doctors__2DC00EBF5B70B5C4");

            entity.HasIndex(e => e.UserId, "UQ__Doctors__1788CC4D518F0D19").IsUnique();

            entity.Property(e => e.ConsultationFee).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.IsAvailable).HasDefaultValue(true);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Qualification).HasMaxLength(150);
            entity.Property(e => e.Specialization).HasMaxLength(100);

            entity.HasOne(d => d.User).WithOne(p => p.Doctor)
                .HasForeignKey<Doctor>(d => d.UserId)
                .HasConstraintName("FK_Doctors_Users");
        });

        modelBuilder.Entity<Medicine>(entity =>
        {
            entity.HasKey(e => e.MedicineId).HasName("PK__Medicine__4F212890E20BA7F8");

            entity.Property(e => e.Description).HasMaxLength(300);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Manufacturer).HasMaxLength(100);
            entity.Property(e => e.MedicineName).HasMaxLength(150);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(10, 2)");
        });

        modelBuilder.Entity<Patient>(entity =>
        {
            entity.HasKey(e => e.PatientId).HasName("PK__Patients__970EC366983150E6");

            entity.Property(e => e.Address).HasMaxLength(300);
            entity.Property(e => e.BloodGroup).HasMaxLength(5);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.Gender).HasMaxLength(20);
            entity.Property(e => e.Phone).HasMaxLength(20);
        });

        modelBuilder.Entity<Prescription>(entity =>
        {
            entity.HasKey(e => e.PrescriptionId).HasName("PK__Prescrip__40130832CC9B911A");

            entity.HasIndex(e => e.VisitId, "IX_Prescriptions_VisitId");

            entity.Property(e => e.Instructions).HasMaxLength(1000);
            entity.Property(e => e.PrescriptionDate).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Visit).WithMany(p => p.Prescriptions)
                .HasForeignKey(d => d.VisitId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Prescriptions_Visits");
        });

        modelBuilder.Entity<PrescriptionItem>(entity =>
        {
            entity.HasKey(e => e.PrescriptionItemId).HasName("PK__Prescrip__1AADD9FAE393BA67");

            entity.Property(e => e.Dosage).HasMaxLength(100);
            entity.Property(e => e.Duration).HasMaxLength(100);
            entity.Property(e => e.Frequency).HasMaxLength(100);
            entity.Property(e => e.Instructions).HasMaxLength(300);

            entity.HasOne(d => d.Medicine).WithMany(p => p.PrescriptionItems)
                .HasForeignKey(d => d.MedicineId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PrescriptionItems_Medicines");

            entity.HasOne(d => d.Prescription).WithMany(p => p.PrescriptionItems)
                .HasForeignKey(d => d.PrescriptionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PrescriptionItems_Prescriptions");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE1A64B2CFD2");

            entity.HasIndex(e => e.RoleName, "UQ__Roles__8A2B6160D76797D8").IsUnique();

            entity.Property(e => e.Description).HasMaxLength(200);
            entity.Property(e => e.RoleName).HasMaxLength(50);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C15670330");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D105348E2BAD09").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Users_Roles");
        });

        modelBuilder.Entity<Visit>(entity =>
        {
            entity.HasKey(e => e.VisitId).HasName("PK__Visits__4D3AA1DE7DAC2ADA");

            entity.HasIndex(e => e.AppointmentId, "IX_Visits_AppointmentId");

            entity.HasIndex(e => e.AppointmentId, "UQ__Visits__8ECDFCC3CF48DB9A").IsUnique();

            entity.Property(e => e.Diagnosis).HasMaxLength(1000);
            entity.Property(e => e.Symptoms).HasMaxLength(1000);
            entity.Property(e => e.VisitDate).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Appointment).WithOne(p => p.Visit)
                .HasForeignKey<Visit>(d => d.AppointmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Visits_Appointments");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
