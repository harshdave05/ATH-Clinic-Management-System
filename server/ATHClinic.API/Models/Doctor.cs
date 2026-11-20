using System;
using System.Collections.Generic;

namespace ATHClinic.API.Models;

public partial class Doctor
{
    public int DoctorId { get; set; }

    public int? UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string Specialization { get; set; } = null!;

    public string? Qualification { get; set; }

    public string? Phone { get; set; }

    public decimal ConsultationFee { get; set; }

    public bool IsAvailable { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual User? User { get; set; }
}
