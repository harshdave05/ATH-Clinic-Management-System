using System;
using System.Collections.Generic;

namespace ATHClinic.API.Models;

public partial class Visit
{
    public int VisitId { get; set; }

    public int AppointmentId { get; set; }

    public string? Symptoms { get; set; }

    public string? Diagnosis { get; set; }

    public string? Notes { get; set; }

    public DateTime VisitDate { get; set; }

    public virtual Appointment Appointment { get; set; } = null!;

    public virtual ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
}
