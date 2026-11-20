using System;
using System.Collections.Generic;

namespace ATHClinic.API.Models;

public partial class Prescription
{
    public int PrescriptionId { get; set; }

    public int VisitId { get; set; }

    public DateTime PrescriptionDate { get; set; }

    public string? Instructions { get; set; }

    public virtual ICollection<PrescriptionItem> PrescriptionItems { get; set; } = new List<PrescriptionItem>();

    public virtual Visit Visit { get; set; } = null!;
}
