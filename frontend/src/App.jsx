
import { useEffect, useState } from "react";
import {
  Activity, Users, CalendarDays, Stethoscope, Pill,
  ClipboardList, LogOut, HeartPulse, RefreshCw,
  UserRound, Clock, ShieldCheck, Plus, Search,
  Pencil, Trash2, X, Save, ArrowLeft
} from "lucide-react";
import api from "./services/api";
import "./App.css";

const roleConfig = {
  Admin: {
    subtitle: "Clinic Administration",
    description: "Monitor and manage your entire clinic.",
    menu: ["Overview", "Patients", "Doctors", "Appointments", "Medicines", "Users"],
  },
  Doctor: {
    subtitle: "Doctor Workspace",
    description: "Manage your consultations and patient care.",
    menu: ["Overview", "Appointments", "Visits", "Prescriptions"],
  },
  Receptionist: {
    subtitle: "Reception Workspace",
    description: "Manage patient registration and appointments.",
    menu: ["Overview", "Patients", "Appointments"],
  },
};

const emptyPatient = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  phone: "",
  email: "",
  address: "",
  bloodGroup: "",
};

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [activePage, setActivePage] = useState("Overview");
  const [dashboardData, setDashboardData] = useState({
    patients: [],
    doctors: [],
    appointments: [],
    medicines: [],
    users: [],
    visits: [],
    prescriptions: [],
  });

  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  // Patient management state
  const [searchTerm, setSearchTerm] = useState("");
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [patientForm, setPatientForm] = useState(emptyPatient);
  const [patientSaving, setPatientSaving] = useState(false);
  const [patientMessage, setPatientMessage] = useState("");
  const [patientError, setPatientError] = useState("");
  // Doctors management state
  const [doctorSearch, setDoctorSearch] = useState("");
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [doctorSaving, setDoctorSaving] = useState(false);
  const [doctorError, setDoctorError] = useState("");
  const [doctorMessage, setDoctorMessage] = useState("");

  const emptyDoctor = {
    fullName: "",
    specialization: "",
    qualification: "",
    phone: "",
    consultationFee: "",
    isAvailable: true,
  };

  const [doctorForm, setDoctorForm] = useState(emptyDoctor);

  // Medicine State
  const emptyMedicine = {
    medicineName: "",
    manufacturer: "",
    description: "",
    unitPrice: "",
    stockQuantity: "",
    isActive: true,
  };

  const [medicineSearch, setMedicineSearch] = useState("");
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [editingMedicineId, setEditingMedicineId] = useState(null);
  const [medicineForm, setMedicineForm] = useState(emptyMedicine);
  const [medicineSaving, setMedicineSaving] = useState(false);
  const [medicineMessage, setMedicineMessage] = useState("");
  const [medicineError, setMedicineError] = useState("");

  // Users Management State
  const emptyUser = {
    fullName: "",
    email: "",
    password: "",
    roleId: "1",
  };

  const [userSearch, setUserSearch] = useState("");
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState(emptyUser);
  const [userSaving, setUserSaving] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [userError, setUserError] = useState("");

  // Appointment management state
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [appointmentSaving, setAppointmentSaving] = useState(false);
  const [appointmentError, setAppointmentError] = useState("");
  const [appointmentMessage, setAppointmentMessage] = useState("");

  const emptyAppointment = {
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    status: "Scheduled",
  };

  const [appointmentForm, setAppointmentForm] = useState(emptyAppointment);

  // Visits Management State
  const emptyVisit = {
    appointmentId: "",
    symptoms: "",
    diagnosis: "",
    notes: "",
  };

  const [visitSearch, setVisitSearch] = useState("");
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [editingVisitId, setEditingVisitId] = useState(null);
  const [visitForm, setVisitForm] = useState(emptyVisit);
  const [visitSaving, setVisitSaving] = useState(false);
  const [visitMessage, setVisitMessage] = useState("");
  const [visitError, setVisitError] = useState("");


  // Prescriptions Management State
  const emptyPrescription = {
    visitId: "",
    instructions: "",
  };

  const [prescriptionSearch, setPrescriptionSearch] = useState("");
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState(emptyPrescription);
  const [prescriptionSaving, setPrescriptionSaving] = useState(false);
  const [prescriptionMessage, setPrescriptionMessage] = useState("");
  const [prescriptionError, setPrescriptionError] = useState("");

  // Prescription Medicine State
  const [showMedicineItemForm, setShowMedicineItemForm] = useState(false);
  const [editingPrescriptionItemId, setEditingPrescriptionItemId] = useState(null);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);

  const emptyPrescriptionItem = {
    medicineId: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: "",
    instructions: "",
  };

  const [prescriptionItemForm, setPrescriptionItemForm] = useState(
    emptyPrescriptionItem
  );
  const [prescriptionItemSaving, setPrescriptionItemSaving] = useState(false);
  const [prescriptionItemError, setPrescriptionItemError] = useState("");
  const [prescriptionItemMessage, setPrescriptionItemMessage] = useState("");



  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const data = response.data;

      sessionStorage.setItem("accessToken", data.accessToken);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      setActivePage("Overview");
      setPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setUser(null);
    setEmail("");
    setPassword("");
    setActivePage("Overview");
    setDashboardData({
      patients: [], doctors: [], appointments: [],
      medicines: [], users: [], visits: [], prescriptions: [],
    });
  };

  const loadDashboard = async () => {
    if (!user) return;

    setDataLoading(true);
    setDataError("");

    const role = user.role;

    const endpoints = {
      patients: "/patients",
      doctors: role === "Admin" ? "/doctors" : null,
      appointments: "/appointments",
      medicines: role === "Admin" ? "/medicines" : null,
      users: role === "Admin" ? "/users" : null,
      visits: role === "Doctor" ? "/visits" : null,
      prescriptions: role === "Doctor" ? "/prescriptions" : null,
    };

    const results = await Promise.all(
      Object.entries(endpoints).map(async ([key, endpoint]) => {
        if (!endpoint) return [key, []];

        try {
          const response = await api.get(endpoint);
          return [key, Array.isArray(response.data) ? response.data : []];
        } catch {
          return [key, []];
        }
      })
    );

    const data = Object.fromEntries(results);
    setDashboardData((previous) => ({ ...previous, ...data }));

    const requiredKeys = role === "Admin"
      ? ["patients", "doctors", "appointments", "medicines", "users"]
      : role === "Doctor"
        ? ["patients", "appointments", "visits", "prescriptions"]
        : ["patients", "appointments"];

    if (requiredKeys.every((key) => data[key].length === 0)) {
      setDataError("No records found yet, or the API could not return dashboard data.");
    } else if (requiredKeys.some((key) => data[key].length === 0)) {
      setDataError("Some dashboard information may be unavailable. Refresh to try again.");
    }

    setDataLoading(false);
  };

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  // Load patients whenever the Patients page is opened.
  useEffect(() => {
    if (user && activePage === "Patients") {
      loadPatients();
    }
  }, [user, activePage]);

  useEffect(() => {
    if (user && activePage === "Appointments") {
      loadAppointments();
    }
  }, [user, activePage]);

  useEffect(() => {
    if (user && user.role === "Admin" && activePage === "Doctors") {
      loadDoctors();
    }
  }, [user, activePage]);

  useEffect(() => {
    if (user && user.role === "Admin" && activePage === "Medicines") {
      loadMedicines();
    }
  }, [user, activePage]);

  useEffect(() => {
    if (user && user.role === "Admin" && activePage === "Users") {
      loadUsers();
    }
  }, [user, activePage]);

  useEffect(() => {
    if (activePage === "Visits" && user?.role === "Doctor") {
      loadVisits();
    }
  }, [activePage, user]);

  useEffect(() => {
    if (activePage === "Prescriptions" && user?.role === "Doctor") {
      loadPrescriptions();
    }
  }, [activePage, user]);

  const loadPatients = async () => {
    try {
      setDataLoading(true);
      setPatientError("");
      const response = await api.get("/patients");
      const patients = Array.isArray(response.data) ? response.data : [];

      setDashboardData((previous) => ({
        ...previous,
        patients,
      }));
    } catch (err) {
      setPatientError(
        err.response?.data?.message || "Unable to load patients."
      );
    } finally {
      setDataLoading(false);
    }
  };

  const openAddPatient = () => {
    setEditingPatientId(null);
    setPatientForm(emptyPatient);
    setPatientMessage("");
    setPatientError("");
    setShowPatientForm(true);
  };

  const openEditPatient = (patient) => {
    setEditingPatientId(patient.patientId);
    setPatientForm({
      fullName: patient.fullName || "",
      gender: patient.gender || "",
      dateOfBirth: patient.dateOfBirth
        ? String(patient.dateOfBirth).split("T")[0]
        : "",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
      bloodGroup: patient.bloodGroup || "",
    });
    setPatientMessage("");
    setPatientError("");
    setShowPatientForm(true);
  };

  const handlePatientFormChange = (e) => {
    const { name, value } = e.target;
    setPatientForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const savePatient = async (e) => {
    e.preventDefault();
    setPatientSaving(true);
    setPatientError("");
    setPatientMessage("");

    try {
      const payload = {
        ...patientForm,
        dateOfBirth: patientForm.dateOfBirth || null,
        email: patientForm.email.trim() || null,
        phone: patientForm.phone.trim() || null,
        address: patientForm.address.trim() || null,
        bloodGroup: patientForm.bloodGroup || null,
      };

      if (editingPatientId) {
        await api.put(`/patients/${editingPatientId}`, payload);
        setPatientMessage("Patient details updated successfully.");
      } else {
        await api.post("/patients", payload);
        setPatientMessage("New patient added successfully.");
      }

      setShowPatientForm(false);
      setPatientForm(emptyPatient);
      setEditingPatientId(null);
      await loadPatients();
      await loadDashboard();
    } catch (err) {
      setPatientError(
        err.response?.data?.message ||
        "Unable to save patient. Please check the entered details."
      );
    } finally {
      setPatientSaving(false);
    }
  };

  const deletePatient = async (patientId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this patient?"
    );

    if (!confirmed) return;

    setPatientError("");
    setPatientMessage("");

    try {
      await api.delete(`/patients/${patientId}`);
      setPatientMessage("Patient deleted successfully.");
      await loadPatients();
      await loadDashboard();
    } catch (err) {
      setPatientError(
        err.response?.data?.message ||
        "Unable to delete patient. The patient may have related appointments."
      );
    }
  };


  const loadDoctors = async () => {
    try {
      setDoctorError("");
      const response = await api.get("/doctors");

      setDashboardData((previous) => ({
        ...previous,
        doctors: Array.isArray(response.data) ? response.data : [],
      }));
    } catch (err) {
      setDoctorError(
        err.response?.data?.message || "Unable to load doctors."
      );
    }
  };

  const openAddDoctor = () => {
    setEditingDoctorId(null);
    setDoctorForm(emptyDoctor);
    setDoctorError("");
    setDoctorMessage("");
    setShowDoctorForm(true);
  };

  const openEditDoctor = (doctor) => {
    setEditingDoctorId(doctor.doctorId);

    setDoctorForm({
      fullName: doctor.fullName || "",
      specialization: doctor.specialization || "",
      qualification: doctor.qualification || "",
      phone: doctor.phone || "",
      consultationFee: doctor.consultationFee ?? "",
      isAvailable: doctor.isAvailable ?? true,
    });

    setDoctorError("");
    setDoctorMessage("");
    setShowDoctorForm(true);
  };

  const handleDoctorChange = (e) => {
    const { name, value, type, checked } = e.target;

    setDoctorForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveDoctor = async (e) => {
    e.preventDefault();

    setDoctorSaving(true);
    setDoctorError("");
    setDoctorMessage("");

    try {
      const payload = {
        fullName: doctorForm.fullName.trim(),
        specialization: doctorForm.specialization.trim() || null,
        qualification: doctorForm.qualification.trim() || null,
        phone: doctorForm.phone.trim() || null,
        consultationFee: Number(doctorForm.consultationFee),
        isAvailable: doctorForm.isAvailable,
      };

      if (editingDoctorId) {
        await api.put(`/doctors/${editingDoctorId}`, payload);
        setDoctorMessage("Doctor updated successfully.");
      } else {
        await api.post("/doctors", payload);
        setDoctorMessage("Doctor added successfully.");
      }

      setShowDoctorForm(false);
      setDoctorForm(emptyDoctor);
      setEditingDoctorId(null);

      await loadDoctors();
      await loadDashboard();
    } catch (err) {
      setDoctorError(
        err.response?.data?.message || "Unable to save doctor."
      );
    } finally {
      setDoctorSaving(false);
    }
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }

    setDoctorError("");
    setDoctorMessage("");

    try {
      await api.delete(`/doctors/${id}`);
      setDoctorMessage("Doctor deleted successfully.");

      await loadDoctors();
      await loadDashboard();
    } catch (err) {
      setDoctorError(
        err.response?.data?.message || "Unable to delete doctor."
      );
    }
  };

  const filteredDoctors = dashboardData.doctors.filter((doctor) => {
    const search = doctorSearch.toLowerCase();

    return (
      String(doctor.fullName || "").toLowerCase().includes(search) ||
      String(doctor.specialization || "").toLowerCase().includes(search) ||
      String(doctor.phone || "").toLowerCase().includes(search)
    );
  });

  const loadMedicines = async () => {
    try {
      const response = await api.get("/medicines");
      setDashboardData((prev) => ({
        ...prev,
        medicines: response.data,
      }));
    } catch (error) {
      setMedicineError(
        error.response?.data?.message || "Unable to load medicines."
      );
    }
  };

  const handleMedicineChange = (e) => {
    const { name, value, type, checked } = e.target;

    setMedicineForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddMedicine = () => {
    setEditingMedicineId(null);
    setMedicineForm(emptyMedicine);
    setMedicineMessage("");
    setMedicineError("");
    setShowMedicineForm(true);
  };

  const openEditMedicine = (medicine) => {
    setEditingMedicineId(medicine.medicineId);
    setMedicineForm({
      medicineName: medicine.medicineName || "",
      manufacturer: medicine.manufacturer || "",
      description: medicine.description || "",
      unitPrice: medicine.unitPrice ?? "",
      stockQuantity: medicine.stockQuantity ?? "",
      isActive: medicine.isActive,
    });
    setMedicineMessage("");
    setMedicineError("");
    setShowMedicineForm(true);
  };

  const saveMedicine = async (e) => {
    e.preventDefault();

    setMedicineSaving(true);
    setMedicineError("");
    setMedicineMessage("");

    const payload = {
      medicineName: medicineForm.medicineName.trim(),
      manufacturer: medicineForm.manufacturer.trim() || null,
      description: medicineForm.description.trim() || null,
      unitPrice: Number(medicineForm.unitPrice),
      stockQuantity: Number(medicineForm.stockQuantity),
      isActive: medicineForm.isActive,
    };

    try {
      if (editingMedicineId) {
        await api.put(`/medicines/${editingMedicineId}`, payload);
        setMedicineMessage("Medicine updated successfully.");
      } else {
        await api.post("/medicines", payload);
        setMedicineMessage("Medicine added successfully.");
      }

      await loadMedicines();
      setShowMedicineForm(false);
      setMedicineForm(emptyMedicine);
      setEditingMedicineId(null);
    } catch (error) {
      setMedicineError(
        error.response?.data?.message || "Unable to save medicine."
      );
    } finally {
      setMedicineSaving(false);
    }
  };

  const deleteMedicine = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this medicine?"
    );

    if (!confirmed) return;

    setMedicineError("");
    setMedicineMessage("");

    try {
      const response = await api.delete(`/medicines/${id}`);
      setMedicineMessage(
        response.data?.message || "Medicine deleted successfully."
      );
      await loadMedicines();
    } catch (error) {
      setMedicineError(
        error.response?.data?.message || "Unable to delete medicine."
      );
    }
  };

  // Load all users
  const loadUsers = async () => {
    try {
      setUserError("");

      const response = await api.get("/users");

      setDashboardData((previous) => ({
        ...previous,
        users: Array.isArray(response.data) ? response.data : [],
      }));
    } catch (err) {
      setUserError(
        err.response?.data?.message || "Unable to load users."
      );
    }
  };

  // Open Add User form
  const openAddUser = () => {
    setEditingUserId(null);
    setUserForm(emptyUser);
    setUserError("");
    setUserMessage("");
    setShowUserForm(true);
  };

  // Open Edit User form
  const openEditUser = (selectedUser) => {
    setEditingUserId(selectedUser.userId);

    setUserForm({
      fullName: selectedUser.fullName || "",
      email: selectedUser.email || "",
      password: "",
      roleId: String(selectedUser.roleId),
    });

    setUserError("");
    setUserMessage("");
    setShowUserForm(true);
  };

  // Handle form changes
  const handleUserChange = (e) => {
    const { name, value } = e.target;

    setUserForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Add or update user
  const saveUser = async (e) => {
    e.preventDefault();

    setUserSaving(true);
    setUserError("");
    setUserMessage("");

    try {
      const payload = {
        fullName: userForm.fullName.trim(),
        email: userForm.email.trim(),
        roleId: Number(userForm.roleId),
      };

      if (editingUserId) {
        await api.put(`/users/${editingUserId}`, payload);
        setUserMessage("User updated successfully.");
      } else {
        await api.post("/users", {
          ...payload,
          password: userForm.password,
        });
        setUserMessage("New user created successfully.");
      }

      setShowUserForm(false);
      setUserForm(emptyUser);
      setEditingUserId(null);

      await loadUsers();
      await loadDashboard();
    } catch (err) {
      setUserError(
        err.response?.data?.message || "Unable to save user."
      );
    } finally {
      setUserSaving(false);
    }
  };

  // Activate or deactivate user
  const toggleUserStatus = async (selectedUser) => {
    const newStatus = !selectedUser.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${newStatus ? "activate" : "deactivate"} ${selectedUser.fullName}?`
    );

    if (!confirmed) return;

    setUserError("");
    setUserMessage("");

    try {
      const response = await api.patch(
        `/users/${selectedUser.userId}/status`,
        { isActive: newStatus }
      );

      setUserMessage(
        response.data?.message || "User status updated successfully."
      );

      await loadUsers();
      await loadDashboard();
    } catch (err) {
      setUserError(
        err.response?.data?.message || "Unable to update user status."
      );
    }
  };

  // Search users
  const filteredUsers = dashboardData.users.filter((item) => {
    const search = userSearch.toLowerCase();

    return (
      String(item.fullName || "").toLowerCase().includes(search) ||
      String(item.email || "").toLowerCase().includes(search) ||
      String(item.roleName || "").toLowerCase().includes(search)
    );
  });


  const loadAppointments = async () => {
    try {
      setDataLoading(true);
      setAppointmentError("");

      const response = await api.get("/appointments");

      setDashboardData((previous) => ({
        ...previous,
        appointments: Array.isArray(response.data) ? response.data : [],
      }));
    } catch (err) {
      setAppointmentError(
        err.response?.data?.message || "Unable to load appointments."
      );
    } finally {
      setDataLoading(false);
    }
  };

  const openAddAppointment = () => {
    setEditingAppointmentId(null);
    setAppointmentForm(emptyAppointment);
    setAppointmentError("");
    setAppointmentMessage("");
    setShowAppointmentForm(true);
  };

  const openEditAppointment = (appointment) => {
    setEditingAppointmentId(appointment.appointmentId);

    setAppointmentForm({
      patientId: String(appointment.patientId),
      doctorId: String(appointment.doctorId),
      appointmentDate: String(appointment.appointmentDate).split("T")[0],
      appointmentTime: String(appointment.appointmentTime).slice(0, 5),
      reason: appointment.reason || "",
      status: appointment.status || "Scheduled",
    });

    setAppointmentError("");
    setAppointmentMessage("");
    setShowAppointmentForm(true);
  };

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;

    setAppointmentForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveAppointment = async (e) => {
    e.preventDefault();
    setAppointmentSaving(true);
    setAppointmentError("");
    setAppointmentMessage("");

    try {
      const payload = {
        patientId: Number(appointmentForm.patientId),
        doctorId: Number(appointmentForm.doctorId),
        appointmentDate: appointmentForm.appointmentDate,
        appointmentTime: appointmentForm.appointmentTime + ":00",
        reason: appointmentForm.reason || null,
        status: appointmentForm.status,
      };

      if (editingAppointmentId) {
        await api.put(
          `/appointments/${editingAppointmentId}`,
          payload
        );
        setAppointmentMessage("Appointment updated successfully.");
      } else {
        await api.post("/appointments", payload);
        setAppointmentMessage("Appointment booked successfully.");
      }

      setShowAppointmentForm(false);
      setAppointmentForm(emptyAppointment);
      setEditingAppointmentId(null);

      await loadAppointments();
      await loadDashboard();
    } catch (err) {
      setAppointmentError(
        err.response?.data?.message ||
        "Unable to save appointment. Check the details and try again."
      );
    } finally {
      setAppointmentSaving(false);
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    setAppointmentError("");
    setAppointmentMessage("");

    try {
      await api.delete(`/appointments/${id}`);
      setAppointmentMessage("Appointment deleted successfully.");

      await loadAppointments();
      await loadDashboard();
    } catch (err) {
      setAppointmentError(
        err.response?.data?.message || "Unable to delete appointment."
      );
    }
  };

  const filteredAppointments = dashboardData.appointments.filter((appointment) => {
    const search = appointmentSearch.toLowerCase();

    return (
      String(appointment.patientName || "").toLowerCase().includes(search) ||
      String(appointment.doctorName || "").toLowerCase().includes(search) ||
      String(appointment.status || "").toLowerCase().includes(search)
    );
  });


  // Load Visits
  const loadVisits = async () => {
    try {
      const response = await api.get("/visits");

      setDashboardData((prev) => ({
        ...prev,
        visits: response.data,
      }));
    } catch (error) {
      setVisitError(
        error.response?.data?.message || "Failed to load visits."
      );
    }
  };

  // Open Add Visit Form
  const openAddVisit = (appointment = null) => {
    setEditingVisitId(null);
    setVisitForm({
      ...emptyVisit,
      appointmentId: appointment?.appointmentId
        ? String(appointment.appointmentId)
        : "",
    });
    setVisitError("");
    setVisitMessage("");
    setShowVisitForm(true);
  };

  // Open Edit Visit Form
  const openEditVisit = (visit) => {
    setEditingVisitId(visit.visitId);
    setVisitForm({
      appointmentId: String(visit.appointmentId),
      symptoms: visit.symptoms || "",
      diagnosis: visit.diagnosis || "",
      notes: visit.notes || "",
    });
    setVisitError("");
    setVisitMessage("");
    setShowVisitForm(true);
  };

  // Handle Visit Form Changes
  const handleVisitChange = (e) => {
    const { name, value } = e.target;

    setVisitForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save Visit
  const saveVisit = async (e) => {
    e.preventDefault();

    setVisitSaving(true);
    setVisitError("");
    setVisitMessage("");

    const payload = {
      symptoms: visitForm.symptoms.trim(),
      diagnosis: visitForm.diagnosis.trim(),
      notes: visitForm.notes.trim(),
    };

    try {
      if (editingVisitId) {
        await api.put(`/visits/${editingVisitId}`, payload);
        setVisitMessage("Visit updated successfully.");
      } else {
        await api.post("/visits", {
          appointmentId: Number(visitForm.appointmentId),
          ...payload,
        });
        setVisitMessage("Visit recorded successfully.");
      }

      setShowVisitForm(false);
      setEditingVisitId(null);
      setVisitForm(emptyVisit);

      await loadVisits();
    } catch (error) {
      setVisitError(
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Failed to save visit. Please try again."
      );
    } finally {
      setVisitSaving(false);
    }
  };

  // Search Visits
  const filteredVisits = (dashboardData.visits || []).filter((visit) => {
    const search = visitSearch.toLowerCase();

    return (
      String(visit.visitId).includes(search) ||
      String(visit.appointmentId).includes(search) ||
      (visit.patientName || "").toLowerCase().includes(search) ||
      (visit.doctorName || "").toLowerCase().includes(search) ||
      (visit.symptoms || "").toLowerCase().includes(search) ||
      (visit.diagnosis || "").toLowerCase().includes(search)
    );
  });


  // Load Prescriptions
  const loadPrescriptions = async () => {
    try {
      const [
        prescriptionsResponse,
        itemsResponse,
        medicinesResponse,
      ] = await Promise.all([
        api.get("/prescriptions"),
        api.get("/prescriptionitems"),
        api.get("/medicines"),
      ]);

      setDashboardData((prev) => ({
        ...prev,
        prescriptions: prescriptionsResponse.data,
        prescriptionItems: itemsResponse.data,
        medicines: medicinesResponse.data,
      }));
    } catch (error) {
      setPrescriptionError(
        error.response?.data?.message ||
        "Failed to load prescriptions."
      );
    }
  };


  // Open Add Prescription Form
  const openAddPrescription = (visit = null) => {
    setEditingPrescriptionId(null);
    setPrescriptionForm({
      ...emptyPrescription,
      visitId: visit?.visitId ? String(visit.visitId) : "",
    });
    setPrescriptionError("");
    setPrescriptionMessage("");
    setShowPrescriptionForm(true);
  };

  // Open Edit Prescription Form
  const openEditPrescription = (prescription) => {
    setEditingPrescriptionId(prescription.prescriptionId);
    setPrescriptionForm({
      visitId: String(prescription.visitId),
      instructions: prescription.instructions || "",
    });
    setPrescriptionError("");
    setPrescriptionMessage("");
    setShowPrescriptionForm(true);
  };

  // Handle Prescription Form Changes
  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;

    setPrescriptionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save Prescription
  const savePrescription = async (e) => {
    e.preventDefault();

    setPrescriptionSaving(true);
    setPrescriptionError("");
    setPrescriptionMessage("");

    try {
      if (editingPrescriptionId) {
        await api.put(`/prescriptions/${editingPrescriptionId}`, {
          instructions: prescriptionForm.instructions.trim(),
        });

        setPrescriptionMessage("Prescription updated successfully.");
      } else {
        await api.post("/prescriptions", {
          visitId: Number(prescriptionForm.visitId),
          instructions: prescriptionForm.instructions.trim(),
        });

        setPrescriptionMessage("Prescription created successfully.");
      }

      setShowPrescriptionForm(false);
      setEditingPrescriptionId(null);
      setPrescriptionForm(emptyPrescription);

      await loadPrescriptions();
    } catch (error) {
      setPrescriptionError(
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Failed to save prescription."
      );
    } finally {
      setPrescriptionSaving(false);
    }
  };

  // Search Prescriptions
  const filteredPrescriptions = (dashboardData.prescriptions || []).filter(
    (prescription) => {
      const search = prescriptionSearch.toLowerCase();

      return (
        String(prescription.prescriptionId).includes(search) ||
        String(prescription.visitId).includes(search) ||
        (prescription.patientName || "").toLowerCase().includes(search) ||
        (prescription.doctorName || "").toLowerCase().includes(search) ||
        (prescription.instructions || "").toLowerCase().includes(search)
      );
    }
  );


  // Open Add Prescription Medicine Form
  const openAddPrescriptionItem = (prescriptionId) => {
    setSelectedPrescriptionId(prescriptionId);
    setEditingPrescriptionItemId(null);
    setPrescriptionItemForm(emptyPrescriptionItem);
    setPrescriptionItemError("");
    setPrescriptionItemMessage("");
    setShowMedicineItemForm(true);
  };

  // Open Edit Prescription Medicine Form
  const openEditPrescriptionItem = (item) => {
    setSelectedPrescriptionId(item.prescriptionId);
    setEditingPrescriptionItemId(item.prescriptionItemId);

    setPrescriptionItemForm({
      medicineId: String(item.medicineId),
      dosage: item.dosage || "",
      frequency: item.frequency || "",
      duration: item.duration || "",
      quantity: String(item.quantity),
      instructions: item.instructions || "",
    });

    setPrescriptionItemError("");
    setPrescriptionItemMessage("");
    setShowMedicineItemForm(true);
  };

  // Handle Prescription Medicine Form Changes
  const handlePrescriptionItemChange = (e) => {
    const { name, value } = e.target;

    setPrescriptionItemForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save Prescription Medicine
  const savePrescriptionItem = async (e) => {
    e.preventDefault();

    setPrescriptionItemSaving(true);
    setPrescriptionItemError("");
    setPrescriptionItemMessage("");

    const payload = {
      prescriptionId: Number(selectedPrescriptionId),
      medicineId: Number(prescriptionItemForm.medicineId),
      dosage: prescriptionItemForm.dosage.trim(),
      frequency: prescriptionItemForm.frequency.trim(),
      duration: prescriptionItemForm.duration.trim(),
      quantity: Number(prescriptionItemForm.quantity),
      instructions: prescriptionItemForm.instructions.trim(),
    };

    try {
      if (editingPrescriptionItemId) {
        await api.put(
          `/prescriptionitems/${editingPrescriptionItemId}`,
          payload
        );

        setPrescriptionItemMessage(
          "Prescription medicine updated successfully."
        );
      } else {
        await api.post("/prescriptionitems", payload);

        setPrescriptionItemMessage(
          "Medicine added to prescription successfully."
        );
      }

      setShowMedicineItemForm(false);
      setEditingPrescriptionItemId(null);
      setPrescriptionItemForm(emptyPrescriptionItem);

      await loadPrescriptions();
    } catch (error) {
      setPrescriptionItemError(
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Failed to save prescription medicine."
      );
    } finally {
      setPrescriptionItemSaving(false);
    }
  };

  const filteredPatients = dashboardData.patients.filter((patient) => {
    const search = searchTerm.toLowerCase();

    return (
      String(patient.fullName || "").toLowerCase().includes(search) ||
      String(patient.phone || "").toLowerCase().includes(search) ||
      String(patient.email || "").toLowerCase().includes(search)
    );
  });

  if (!user) {
    return (
      <div className="login-page">
        <section className="login-left">
          <div className="brand">
            <HeartPulse size={34} />
            <span>ATH Clinic</span>
          </div>

          <div className="hero-content">
            <div className="hero-icon"><Activity size={48} /></div>
            <p className="eyebrow">SMART HEALTHCARE MANAGEMENT</p>
            <h1>Better Care.<br />Better Management.</h1>
            <p className="hero-description">
              A centralized clinic management system to manage
              patients, appointments, doctors and prescriptions.
            </p>
          </div>

          <p className="copyright">© 2026 ATH Clinic Management System</p>
        </section>

        <section className="login-right">
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-heading">
              <p className="eyebrow">WELCOME BACK</p>
              <h2>Sign in to your account</h2>
              <p>Enter your credentials to access your dashboard.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <UserRound size={19} />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <ShieldCheck size={19} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="secure-note">
              <ShieldCheck size={14} /> Secure access for authorized clinic staff
            </p>
          </form>
        </section>
      </div>
    );
  }


  const config = roleConfig[user.role] || roleConfig.Receptionist;

  const stats = user.role === "Admin"
    ? [
      { title: "Total Patients", value: dashboardData.patients.length, icon: Users, color: "blue" },
      { title: "Total Doctors", value: dashboardData.doctors.length, icon: Stethoscope, color: "green" },
      { title: "Appointments", value: dashboardData.appointments.length, icon: CalendarDays, color: "purple" },
      { title: "Medicines", value: dashboardData.medicines.length, icon: Pill, color: "orange" },
      { title: "System Users", value: dashboardData.users.length, icon: ShieldCheck, color: "teal" },
    ]
    : user.role === "Doctor"
      ? [
        { title: "My Patients", value: dashboardData.patients.length, icon: Users, color: "blue" },
        { title: "My Appointments", value: dashboardData.appointments.length, icon: CalendarDays, color: "purple" },
        { title: "My Visits", value: dashboardData.visits.length, icon: ClipboardList, color: "green" },
        { title: "Prescriptions", value: dashboardData.prescriptions.length, icon: Pill, color: "orange" },
      ]
      : [
        { title: "Total Patients", value: dashboardData.patients.length, icon: Users, color: "blue" },
        { title: "Appointments", value: dashboardData.appointments.length, icon: CalendarDays, color: "purple" },
        {
          title: "Scheduled",
          value: dashboardData.appointments.filter((a) =>
            String(a.status || "").toLowerCase() === "scheduled"
          ).length,
          icon: Clock,
          color: "green",
        },
      ];

  const menuIcons = {
    Overview: Activity,
    Patients: Users,
    Doctors: Stethoscope,
    Appointments: CalendarDays,
    Medicines: Pill,
    Users: ShieldCheck,
    Visits: ClipboardList,
    Prescriptions: ClipboardList,
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <HeartPulse size={29} />
          <span>ATH Clinic</span>
        </div>

        <div className="sidebar-section">MAIN MENU</div>

        <nav className="sidebar-menu">
          {config.menu.map((item) => {
            const Icon = menuIcons[item] || Activity;
            return (
              <button
                key={item}
                className={`menu-item ${activePage === item ? "active" : ""}`}
                onClick={() => {
                  setActivePage(item);
                  setShowPatientForm(false);
                  setPatientMessage("");
                  setPatientError("");
                }}
              >
                <Icon size={19} />
                <span>{item}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-mini">
            <div className="avatar">{user.fullName?.charAt(0) || "U"}</div>
            <div>
              <strong>{user.fullName}</strong>
              <span>{user.role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>{activePage}</h2>
            <p>{config.subtitle}</p>
          </div>
          <div className="topbar-right">
            <span className="status-dot"></span>
            <span>System Online</span>
            <div className="top-avatar">{user.fullName?.charAt(0) || "U"}</div>
          </div>
        </header>

        <section className="page-content">

          {activePage === "Medicines" ? (
            <>
              <div className="section-heading">
                <div>
                  <h2>Medicine Management</h2>
                  <p>Manage clinic medicines, prices and available stock.</p>
                </div>

                <button
                  className="refresh-btn"
                  onClick={loadMedicines}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {medicineMessage && (
                <div className="success-message">{medicineMessage}</div>
              )}

              {medicineError && (
                <div className="error-message">{medicineError}</div>
              )}

              {!showMedicineForm ? (
                <>
                  <div className="patient-toolbar">
                    <div className="patient-search">
                      <Search size={18} />
                      <input
                        placeholder="Search medicine or manufacturer..."
                        value={medicineSearch}
                        onChange={(e) => setMedicineSearch(e.target.value)}
                      />
                    </div>

                    <button
                      className="login-btn add-patient-btn"
                      onClick={openAddMedicine}
                    >
                      <Plus size={18} /> Add Medicine
                    </button>
                  </div>

                  <section className="table-card">
                    <div className="table-heading">
                      <div>
                        <h2>Medicine Records</h2>
                        <p>All registered clinic medicines.</p>
                      </div>

                      <span className="record-count">
                        {(dashboardData.medicines || []).filter((medicine) =>
                          `${medicine.medicineName} ${medicine.manufacturer || ""}`
                            .toLowerCase()
                            .includes(medicineSearch.toLowerCase())
                        ).length} records
                      </span>
                    </div>

                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Medicine Name</th>
                            <th>Manufacturer</th>
                            <th>Unit Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {(dashboardData.medicines || [])
                            .filter((medicine) =>
                              `${medicine.medicineName} ${medicine.manufacturer || ""}`
                                .toLowerCase()
                                .includes(medicineSearch.toLowerCase())
                            )
                            .map((medicine) => (
                              <tr key={medicine.medicineId}>
                                <td>#{medicine.medicineId}</td>

                                <td>
                                  <strong>{medicine.medicineName}</strong>
                                  <small className="table-subtext">
                                    {medicine.description || "No description"}
                                  </small>
                                </td>

                                <td>{medicine.manufacturer || "—"}</td>

                                <td>
                                  ₹{Number(medicine.unitPrice || 0).toFixed(2)}
                                </td>

                                <td>
                                  <span className={
                                    medicine.stockQuantity <= 10
                                      ? "stock-low"
                                      : "stock-normal"
                                  }>
                                    {medicine.stockQuantity}
                                  </span>
                                </td>

                                <td>
                                  <span className={
                                    medicine.isActive
                                      ? "status-active"
                                      : "status-inactive"
                                  }>
                                    {medicine.isActive ? "Active" : "Inactive"}
                                  </span>
                                </td>

                                <td>
                                  <div className="patient-actions">
                                    <button
                                      className="icon-action edit"
                                      title="Edit medicine"
                                      onClick={() => openEditMedicine(medicine)}
                                    >
                                      <Pencil size={16} />
                                    </button>

                                    <button
                                      className="icon-action delete"
                                      title="Delete medicine"
                                      onClick={() => deleteMedicine(medicine.medicineId)}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}

                          {(dashboardData.medicines || []).filter((medicine) =>
                            `${medicine.medicineName} ${medicine.manufacturer || ""}`
                              .toLowerCase()
                              .includes(medicineSearch.toLowerCase())
                          ).length === 0 && (
                              <tr>
                                <td colSpan="7" className="empty-state">
                                  No medicines found.
                                </td>
                              </tr>
                            )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              ) : (
                <section className="table-card patient-form-card">
                  <div className="table-heading">
                    <div>
                      <h2>
                        {editingMedicineId ? "Edit Medicine" : "Add New Medicine"}
                      </h2>
                      <p>Enter the medicine details below.</p>
                    </div>

                    <button
                      className="icon-action"
                      onClick={() => setShowMedicineForm(false)}
                      type="button"
                    >
                      <X size={19} />
                    </button>
                  </div>

                  <form className="patient-form" onSubmit={saveMedicine}>
                    <div className="patient-form-grid">
                      <div className="patient-field">
                        <label>Medicine Name *</label>
                        <input
                          name="medicineName"
                          value={medicineForm.medicineName}
                          onChange={handleMedicineChange}
                          placeholder="Enter medicine name"
                          required
                        />
                      </div>

                      <div className="patient-field">
                        <label>Manufacturer</label>
                        <input
                          name="manufacturer"
                          value={medicineForm.manufacturer}
                          onChange={handleMedicineChange}
                          placeholder="Enter manufacturer"
                        />
                      </div>

                      <div className="patient-field">
                        <label>Unit Price (₹) *</label>
                        <input
                          type="number"
                          name="unitPrice"
                          min="0"
                          step="0.01"
                          value={medicineForm.unitPrice}
                          onChange={handleMedicineChange}
                          placeholder="Enter price"
                          required
                        />
                      </div>

                      <div className="patient-field">
                        <label>Stock Quantity *</label>
                        <input
                          type="number"
                          name="stockQuantity"
                          min="0"
                          step="1"
                          value={medicineForm.stockQuantity}
                          onChange={handleMedicineChange}
                          placeholder="Enter stock"
                          required
                        />
                      </div>

                      <div className="patient-field full-width">
                        <label>Description</label>
                        <textarea
                          name="description"
                          value={medicineForm.description}
                          onChange={handleMedicineChange}
                          placeholder="Enter medicine description"
                          rows="3"
                        />
                      </div>

                      <div className="patient-field checkbox-field">
                        <label>
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={medicineForm.isActive}
                            onChange={handleMedicineChange}
                          />
                          Medicine is active
                        </label>
                      </div>
                    </div>

                    {medicineError && (
                      <div className="error-message">{medicineError}</div>
                    )}

                    <div className="patient-form-actions">
                      <button
                        type="button"
                        className="refresh-btn"
                        onClick={() => setShowMedicineForm(false)}
                      >
                        <ArrowLeft size={16} /> Cancel
                      </button>

                      <button
                        type="submit"
                        className="login-btn save-patient-btn"
                        disabled={medicineSaving}
                      >
                        <Save size={17} />
                        {medicineSaving
                          ? "Saving..."
                          : editingMedicineId
                            ? "Update Medicine"
                            : "Save Medicine"}
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </>
          ) : activePage === "Users" ? (
            <>

              <div className="section-heading">
                <div>
                  <h2>Users Management</h2>
                  <p>Create and manage clinic staff accounts and access roles.</p>
                </div>

                <button
                  className="refresh-btn"
                  onClick={loadUsers}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {userMessage && (
                <div className="success-message">{userMessage}</div>
              )}

              {userError && (
                <div className="error-message">{userError}</div>
              )}

              {!showUserForm ? (
                <>
                  <div className="patient-toolbar">
                    <div className="patient-search">
                      <Search size={18} />
                      <input
                        type="text"
                        placeholder="Search by name, email or role..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                    </div>

                    <button
                      className="login-btn add-patient-btn"
                      onClick={openAddUser}
                    >
                      <Plus size={18} /> Add User
                    </button>
                  </div>

                  <section className="table-card">
                    <div className="table-heading">
                      <div>
                        <h2>Staff Accounts</h2>
                        <p>All registered clinic system users.</p>
                      </div>

                      <span className="record-count">
                        {filteredUsers.length} records
                      </span>
                    </div>

                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredUsers.map((item) => (
                            <tr key={item.userId}>
                              <td>#{item.userId}</td>
                              <td><strong>{item.fullName}</strong></td>
                              <td>{item.email}</td>
                              <td>{item.roleName}</td>
                              <td>
                                <span className={
                                  item.isActive
                                    ? "status-active"
                                    : "status-inactive"
                                }>
                                  {item.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td>
                                {item.createdAt
                                  ? new Date(item.createdAt).toLocaleDateString()
                                  : "—"}
                              </td>
                              <td>
                                <div className="patient-actions">
                                  <button
                                    className="icon-action edit"
                                    title="Edit user"
                                    onClick={() => openEditUser(item)}
                                  >
                                    <Pencil size={16} />
                                  </button>

                                  <button
                                    className="icon-action"
                                    title={item.isActive ? "Deactivate user" : "Activate user"}
                                    disabled={
                                      Number(item.userId) === Number(user.userId)
                                    }
                                    onClick={() => toggleUserStatus(item)}
                                  >
                                    <ShieldCheck size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {filteredUsers.length === 0 && (
                            <tr>
                              <td colSpan="7" className="empty-state">
                                No users found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              ) : (
                <section className="table-card patient-form-card">
                  <div className="table-heading">
                    <div>
                      <h2>
                        {editingUserId ? "Edit User" : "Create New User"}
                      </h2>
                      <p>Enter the staff account details below.</p>
                    </div>

                    <button
                      className="icon-action"
                      type="button"
                      onClick={() => setShowUserForm(false)}
                    >
                      <X size={19} />
                    </button>
                  </div>

                  <form className="patient-form" onSubmit={saveUser}>
                    <div className="patient-form-grid">
                      <div className="patient-field">
                        <label>Full Name *</label>
                        <input
                          name="fullName"
                          value={userForm.fullName}
                          onChange={handleUserChange}
                          placeholder="Enter full name"
                          required
                        />
                      </div>

                      <div className="patient-field">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={userForm.email}
                          onChange={handleUserChange}
                          placeholder="Enter email address"
                          required
                        />
                      </div>

                      {!editingUserId && (
                        <div className="patient-field">
                          <label>Password *</label>
                          <input
                            type="password"
                            name="password"
                            value={userForm.password}
                            onChange={handleUserChange}
                            placeholder="Minimum 8 characters"
                            minLength="8"
                            required
                          />
                        </div>
                      )}

                      <div className="patient-field">
                        <label>Account Role *</label>
                        <select
                          name="roleId"
                          value={userForm.roleId}
                          onChange={handleUserChange}
                          required
                        >
                          <option value="1">Receptionist</option>
                          <option value="2">Admin</option>
                          <option value="3">Doctor</option>
                        </select>
                      </div>
                    </div>

                    {userError && (
                      <div className="error-message">{userError}</div>
                    )}

                    <div className="patient-form-actions">
                      <button
                        type="button"
                        className="refresh-btn"
                        onClick={() => setShowUserForm(false)}
                      >
                        <ArrowLeft size={16} /> Cancel
                      </button>

                      <button
                        type="submit"
                        className="login-btn save-patient-btn"
                        disabled={userSaving}
                      >
                        <Save size={17} />
                        {userSaving
                          ? "Saving..."
                          : editingUserId
                            ? "Update User"
                            : "Create User"}
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </>
          ) : activePage === "Doctors" ? (
            <>
              <div className="section-heading">
                <div>
                  <h2>Doctors Management</h2>
                  <p>Add, update and manage clinic doctors.</p>
                </div>

                <button
                  className="refresh-btn"
                  onClick={loadDoctors}
                  disabled={dataLoading}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {doctorMessage && (
                <div className="success-message">{doctorMessage}</div>
              )}

              {doctorError && (
                <div className="error-message">{doctorError}</div>
              )}

              {!showDoctorForm ? (
                <>
                  <div className="patient-toolbar">
                    <div className="patient-search">
                      <Search size={18} />
                      <input
                        placeholder="Search doctor by name, specialization or phone..."
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                      />
                    </div>

                    <button
                      className="login-btn add-patient-btn"
                      onClick={openAddDoctor}
                    >
                      <Plus size={18} /> Add Doctor
                    </button>
                  </div>

                  <section className="table-card">
                    <div className="table-heading">
                      <div>
                        <h2>Doctor Records</h2>
                        <p>All registered clinic doctors.</p>
                      </div>

                      <span className="record-count">
                        {filteredDoctors.length} records
                      </span>
                    </div>

                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Doctor Name</th>
                            <th>Specialization</th>
                            <th>Qualification</th>
                            <th>Phone</th>
                            <th>Consultation Fee</th>
                            <th>Availability</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredDoctors.map((doctor) => (
                            <tr key={doctor.doctorId}>
                              <td>#{doctor.doctorId}</td>
                              <td><strong>{doctor.fullName}</strong></td>
                              <td>{doctor.specialization || "—"}</td>
                              <td>{doctor.qualification || "—"}</td>
                              <td>{doctor.phone || "—"}</td>
                              <td>
                                ₹{Number(doctor.consultationFee || 0).toFixed(2)}
                              </td>
                              <td>
                                <span
                                  className={`status-badge ${doctor.isAvailable ? "completed" : "cancelled"
                                    }`}
                                >
                                  {doctor.isAvailable ? "Available" : "Unavailable"}
                                </span>
                              </td>
                              <td>
                                <div className="patient-actions">
                                  <button
                                    className="icon-action edit"
                                    title="Edit doctor"
                                    onClick={() => openEditDoctor(doctor)}
                                  >
                                    <Pencil size={16} />
                                  </button>

                                  <button
                                    className="icon-action delete"
                                    title="Delete doctor"
                                    onClick={() => deleteDoctor(doctor.doctorId)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {!dataLoading && filteredDoctors.length === 0 && (
                            <tr>
                              <td colSpan="8" className="empty-state">
                                No doctors found.
                              </td>
                            </tr>
                          )}

                          {dataLoading && (
                            <tr>
                              <td colSpan="8" className="empty-state">
                                Loading doctors...
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              ) : (
                <section className="table-card patient-form-card">
                  <div className="table-heading">
                    <div>
                      <h2>
                        {editingDoctorId ? "Edit Doctor" : "Register New Doctor"}
                      </h2>
                      <p>Enter the doctor's professional details.</p>
                    </div>

                    <button
                      className="icon-action"
                      onClick={() => setShowDoctorForm(false)}
                      type="button"
                    >
                      <X size={19} />
                    </button>
                  </div>

                  <form className="patient-form" onSubmit={saveDoctor}>
                    <div className="patient-form-grid">
                      <div className="patient-field">
                        <label>Full Name *</label>
                        <input
                          name="fullName"
                          value={doctorForm.fullName}
                          onChange={handleDoctorChange}
                          placeholder="Enter doctor's name"
                          required
                        />
                      </div>

                      <div className="patient-field">
                        <label>Specialization</label>
                        <input
                          name="specialization"
                          value={doctorForm.specialization}
                          onChange={handleDoctorChange}
                          placeholder="e.g. Cardiologist"
                        />
                      </div>

                      <div className="patient-field">
                        <label>Qualification</label>
                        <input
                          name="qualification"
                          value={doctorForm.qualification}
                          onChange={handleDoctorChange}
                          placeholder="e.g. MBBS, MD"
                        />
                      </div>

                      <div className="patient-field">
                        <label>Phone Number</label>
                        <input
                          name="phone"
                          value={doctorForm.phone}
                          onChange={handleDoctorChange}
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="patient-field">
                        <label>Consultation Fee (₹) *</label>
                        <input
                          type="number"
                          name="consultationFee"
                          min="0"
                          step="0.01"
                          value={doctorForm.consultationFee}
                          onChange={handleDoctorChange}
                          placeholder="Enter consultation fee"
                          required
                        />
                      </div>

                      <div className="patient-field">
                        <label>Availability</label>
                        <select
                          name="isAvailable"
                          value={String(doctorForm.isAvailable)}
                          onChange={(e) =>
                            setDoctorForm((previous) => ({
                              ...previous,
                              isAvailable: e.target.value === "true",
                            }))
                          }
                        >
                          <option value="true">Available</option>
                          <option value="false">Unavailable</option>
                        </select>
                      </div>
                    </div>

                    {doctorError && (
                      <div className="error-message">{doctorError}</div>
                    )}

                    <div className="patient-form-actions">
                      <button
                        type="button"
                        className="refresh-btn"
                        onClick={() => setShowDoctorForm(false)}
                      >
                        <ArrowLeft size={16} /> Cancel
                      </button>

                      <button
                        type="submit"
                        className="login-btn save-patient-btn"
                        disabled={doctorSaving}
                      >
                        <Save size={17} />
                        {doctorSaving
                          ? "Saving..."
                          : editingDoctorId
                            ? "Update Doctor"
                            : "Save Doctor"}
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </>
          ) : activePage === "Appointments" ? (
            <>
              <div className="section-heading">
                <div>
                  <h2>Appointments Management</h2>
                  <p>Schedule and manage clinic appointments.</p>
                </div>

                <button
                  className="refresh-btn"
                  onClick={loadAppointments}
                  disabled={dataLoading}
                >
                  <RefreshCw size={16} className={dataLoading ? "spin" : ""} />
                  Refresh
                </button>
              </div>

              {appointmentMessage && (
                <div className="success-message">{appointmentMessage}</div>
              )}

              {appointmentError && (
                <div className="error-message">{appointmentError}</div>
              )}

              {!showAppointmentForm ? (
                <>
                  <div className="patient-toolbar">
                    <div className="patient-search">
                      <Search size={18} />
                      <input
                        placeholder="Search patient, doctor or status..."
                        value={appointmentSearch}
                        onChange={(e) => setAppointmentSearch(e.target.value)}
                      />
                    </div>

                    {(user.role === "Admin" || user.role === "Receptionist") && (
                      <button
                        className="login-btn add-patient-btn"
                        onClick={openAddAppointment}
                      >
                        <Plus size={18} /> Book Appointment
                      </button>
                    )}
                  </div>

                  <section className="table-card">
                    <div className="table-heading">
                      <div>
                        <h2>Appointment Records</h2>
                        <p>All appointments available to your account.</p>
                      </div>
                      <span className="record-count">
                        {filteredAppointments.length} records
                      </span>
                    </div>

                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Patient</th>
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredAppointments.map((appointment) => (
                            <tr key={appointment.appointmentId}>
                              <td>#{appointment.appointmentId}</td>
                              <td><strong>{appointment.patientName}</strong></td>
                              <td>{appointment.doctorName}</td>
                              <td>{appointment.appointmentDate}</td>
                              <td>{String(appointment.appointmentTime).slice(0, 5)}</td>
                              <td>{appointment.reason || "—"}</td>
                              <td>
                                <span
                                  className={`status-badge ${String(appointment.status).toLowerCase()}`}
                                >
                                  {appointment.status}
                                </span>
                              </td>
                              <td>
                                <div className="patient-actions">
                                  {(user.role === "Admin" || user.role === "Receptionist") && (
                                    <button
                                      className="icon-action edit"
                                      title="Edit appointment"
                                      onClick={() => openEditAppointment(appointment)}
                                    >
                                      <Pencil size={16} />
                                    </button>
                                  )}

                                  {user.role === "Admin" && (
                                    <button
                                      className="icon-action delete"
                                      title="Delete appointment"
                                      onClick={() => deleteAppointment(appointment.appointmentId)}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}

                          {!dataLoading && filteredAppointments.length === 0 && (
                            <tr>
                              <td colSpan="8" className="empty-state">
                                No appointments found.
                              </td>
                            </tr>
                          )}

                          {dataLoading && (
                            <tr>
                              <td colSpan="8" className="empty-state">
                                Loading appointments...
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              ) : (
                <section className="table-card patient-form-card">
                  <div className="table-heading">
                    <div>
                      <h2>
                        {editingAppointmentId ? "Edit Appointment" : "Book New Appointment"}
                      </h2>
                      <p>Enter appointment details below.</p>
                    </div>

                    <button
                      className="icon-action"
                      onClick={() => setShowAppointmentForm(false)}
                    >
                      <X size={19} />
                    </button>
                  </div>

                  <form className="patient-form" onSubmit={saveAppointment}>
                    <div className="patient-form-grid">
                      <div className="patient-field">
                        <label>Patient *</label>
                        <select
                          name="patientId"
                          value={appointmentForm.patientId}
                          onChange={handleAppointmentChange}
                          required
                        >
                          <option value="">Select patient</option>
                          {dashboardData.patients.map((patient) => (
                            <option key={patient.patientId} value={patient.patientId}>
                              {patient.fullName} (#{patient.patientId})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="patient-field">
                        <label>Doctor ID *</label>
                        <input
                          type="number"
                          name="doctorId"
                          min="1"
                          value={appointmentForm.doctorId}
                          onChange={handleAppointmentChange}
                          placeholder="Enter doctor ID"
                          required
                        />
                        {user.role === "Admin" && dashboardData.doctors.length > 0 && (
                          <small>
                            Available doctor: {dashboardData.doctors.map((d) =>
                              `${d.fullName} (ID: ${d.doctorId})`
                            ).join(", ")}
                          </small>
                        )}
                      </div>

                      <div className="patient-field">
                        <label>Appointment Date *</label>
                        <input
                          type="date"
                          name="appointmentDate"
                          min={new Date().toLocaleDateString("en-CA")}
                          value={appointmentForm.appointmentDate}
                          onChange={handleAppointmentChange}
                          required
                        />
                      </div>

                      <div className="patient-field">
                        <label>Appointment Time *</label>
                        <input
                          type="time"
                          name="appointmentTime"
                          value={appointmentForm.appointmentTime}
                          onChange={handleAppointmentChange}
                          required
                        />
                      </div>

                      <div className="patient-field">
                        <label>Status *</label>
                        <select
                          name="status"
                          value={appointmentForm.status}
                          onChange={handleAppointmentChange}
                          required
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="patient-field">
                        <label>Reason</label>
                        <input
                          name="reason"
                          value={appointmentForm.reason}
                          onChange={handleAppointmentChange}
                          placeholder="Reason for appointment"
                        />
                      </div>
                    </div>

                    {appointmentError && (
                      <div className="error-message">{appointmentError}</div>
                    )}

                    <div className="patient-form-actions">
                      <button
                        type="button"
                        className="refresh-btn"
                        onClick={() => setShowAppointmentForm(false)}
                      >
                        <ArrowLeft size={16} /> Cancel
                      </button>

                      <button
                        type="submit"
                        className="login-btn save-patient-btn"
                        disabled={appointmentSaving}
                      >
                        <Save size={17} />
                        {appointmentSaving
                          ? "Saving..."
                          : editingAppointmentId
                            ? "Update Appointment"
                            : "Book Appointment"}
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </>

          ) : activePage === "Visits" ? (
            <>
              <div className="section-heading">
                <div>
                  <h2>Visits Management</h2>
                  <p>Record and manage patient consultations.</p>
                </div>

                <button
                  className="refresh-btn"
                  onClick={loadVisits}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {visitMessage && (
                <div className="success-message">{visitMessage}</div>
              )}

              {visitError && (
                <div className="error-message">{visitError}</div>
              )}

              {!showVisitForm ? (
                <>
                  <div className="patient-toolbar">
                    <div className="patient-search">
                      <Search size={18} />
                      <input
                        placeholder="Search patient, symptoms or diagnosis..."
                        value={visitSearch}
                        onChange={(e) => setVisitSearch(e.target.value)}
                      />
                    </div>

                    <button
                      className="login-btn add-patient-btn"
                      onClick={() => openAddVisit()}
                    >
                      <Plus size={18} /> Record Visit
                    </button>
                  </div>

                  <section className="table-card">
                    <div className="table-heading">
                      <div>
                        <h2>Visit Records</h2>
                        <p>Consultation history of your patients.</p>
                      </div>
                      <span className="record-count">
                        {filteredVisits.length} records
                      </span>
                    </div>

                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Patient</th>
                            <th>Appointment</th>
                            <th>Visit Date</th>
                            <th>Symptoms</th>
                            <th>Diagnosis</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredVisits.map((visit) => (
                            <tr key={visit.visitId}>
                              <td>#{visit.visitId}</td>
                              <td><strong>{visit.patientName}</strong></td>
                              <td>#{visit.appointmentId}</td>
                              <td>
                                {visit.visitDate
                                  ? new Date(visit.visitDate).toLocaleDateString()
                                  : "—"}
                              </td>
                              <td>{visit.symptoms || "—"}</td>
                              <td>{visit.diagnosis || "—"}</td>
                              <td>
                                <div className="patient-actions">
                                  <button
                                    className="icon-action edit"
                                    title="Edit visit"
                                    onClick={() => openEditVisit(visit)}
                                  >
                                    <Pencil size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {!filteredVisits.length && (
                            <tr>
                              <td colSpan="7" className="empty-state">
                                No visit records found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              ) : (
                <section className="table-card patient-form-card">
                  <div className="table-heading">
                    <div>
                      <h2>
                        {editingVisitId ? "Edit Visit" : "Record New Visit"}
                      </h2>
                      <p>Enter patient consultation details below.</p>
                    </div>

                    <button
                      className="icon-action"
                      onClick={() => setShowVisitForm(false)}
                    >
                      <X size={19} />
                    </button>
                  </div>

                  <form className="patient-form" onSubmit={saveVisit}>
                    <div className="patient-form-grid">
                      <div className="patient-field">
                        <label>Appointment *</label>
                        <select
                          name="appointmentId"
                          value={visitForm.appointmentId}
                          onChange={handleVisitChange}
                          disabled={!!editingVisitId}
                          required
                        >
                          <option value="">Select appointment</option>

                          {editingVisitId ? (
                            <option value={visitForm.appointmentId}>
                              Appointment #{visitForm.appointmentId}
                            </option>
                          ) : (
                            dashboardData.appointments
                              .filter((appointment) =>
                                !(dashboardData.visits || []).some(
                                  (visit) =>
                                    visit.appointmentId === appointment.appointmentId
                                )
                              )
                              .map((appointment) => (
                                <option
                                  key={appointment.appointmentId}
                                  value={appointment.appointmentId}
                                >
                                  #{appointment.appointmentId} - {appointment.patientName}
                                  {" | "}{appointment.appointmentDate}
                                </option>
                              ))
                          )}
                        </select>
                      </div>

                      <div className="patient-field">
                        <label>Symptoms *</label>
                        <input
                          name="symptoms"
                          value={visitForm.symptoms}
                          onChange={handleVisitChange}
                          placeholder="Enter patient symptoms"
                          required
                        />
                      </div>

                      <div className="patient-field">
                        <label>Diagnosis *</label>
                        <input
                          name="diagnosis"
                          value={visitForm.diagnosis}
                          onChange={handleVisitChange}
                          placeholder="Enter diagnosis"
                          required
                        />
                      </div>

                      <div className="patient-field">
                        <label>Additional Notes</label>
                        <textarea
                          name="notes"
                          value={visitForm.notes}
                          onChange={handleVisitChange}
                          placeholder="Enter consultation notes"
                          rows="3"
                        />
                      </div>
                    </div>

                    {visitError && (
                      <div className="error-message">{visitError}</div>
                    )}

                    <div className="patient-form-actions">
                      <button
                        type="button"
                        className="refresh-btn"
                        onClick={() => setShowVisitForm(false)}
                      >
                        <ArrowLeft size={16} /> Cancel
                      </button>

                      <button
                        type="submit"
                        className="login-btn save-patient-btn"
                        disabled={visitSaving}
                      >
                        <Save size={17} />
                        {visitSaving
                          ? "Saving..."
                          : editingVisitId
                            ? "Update Visit"
                            : "Save Visit"}
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </>

          ) : activePage === "Prescriptions" ? (
            <div className="prescriptions-page">
              <div className="page-header">
                <div>
                  <h2>Prescriptions</h2>
                  <p>Manage patient prescriptions and prescribed medicines.</p>
                </div>


                <div className="header-actions">
                  <button
                    className="secondary-btn"
                    onClick={loadPrescriptions}
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>

                  <button
                    className="primary-btn"
                    onClick={() => openAddPrescription()}
                  >
                    <Plus size={17} />
                    Create Prescription
                  </button>
                </div>

              </div>

              {prescriptionMessage && (
                <div className="success-message">{prescriptionMessage}</div>
              )}

              {prescriptionError && (
                <div className="error-message">{prescriptionError}</div>
              )}

              <div className="search-bar">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search by patient, doctor, visit ID..."
                  value={prescriptionSearch}
                  onChange={(e) => setPrescriptionSearch(e.target.value)}
                />
              </div>

              {showPrescriptionForm && (
                <div className="form-card">
                  <h3>
                    {editingPrescriptionId
                      ? "Edit Prescription"
                      : "Create Prescription"}
                  </h3>

                  <form onSubmit={savePrescription}>
                    <div className="form-grid">
                      {!editingPrescriptionId && (
                        <div className="form-group">
                          <label>Select Visit *</label>
                          <select
                            name="visitId"
                            value={prescriptionForm.visitId}
                            onChange={handlePrescriptionChange}
                            required
                          >
                            <option value="">Select a visit</option>

                            {(dashboardData.visits || [])
                              .filter(
                                (visit) =>
                                  !(dashboardData.prescriptions || []).some(
                                    (p) => p.visitId === visit.visitId
                                  )
                              )
                              .map((visit) => (
                                <option
                                  key={visit.visitId}
                                  value={visit.visitId}
                                >
                                  Visit #{visit.visitId} - {visit.patientName}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}

                      <div className="form-group">
                        <label>Prescription Instructions</label>
                        <textarea
                          name="instructions"
                          value={prescriptionForm.instructions}
                          onChange={handlePrescriptionChange}
                          placeholder="Enter general prescription instructions..."
                          rows="3"
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        type="submit"
                        className="primary-btn"
                        disabled={prescriptionSaving}
                      >
                        <Save size={16} />
                        {prescriptionSaving ? "Saving..." : "Save Prescription"}
                      </button>

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => {
                          setShowPrescriptionForm(false);
                          setEditingPrescriptionId(null);
                          setPrescriptionForm(emptyPrescription);
                          setPrescriptionError("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}


              {prescriptionItemMessage && (
                <div className="success-message">
                  {prescriptionItemMessage}
                </div>
              )}

              {showMedicineItemForm && (
                <div className="form-card">
                  <h3>
                    {editingPrescriptionItemId
                      ? "Edit Prescribed Medicine"
                      : "Add Medicine to Prescription"}
                  </h3>

                  <p>
                    Prescription ID: #{selectedPrescriptionId}
                  </p>

                  {prescriptionItemError && (
                    <div className="error-message">
                      {prescriptionItemError}
                    </div>
                  )}

                  <form onSubmit={savePrescriptionItem}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Select Medicine *</label>
                        <select
                          name="medicineId"
                          value={prescriptionItemForm.medicineId}
                          onChange={handlePrescriptionItemChange}
                          required
                        >
                          <option value="">Select medicine</option>

                          {(dashboardData.medicines || [])
                            .filter((medicine) => medicine.isActive)
                            .map((medicine) => (
                              <option
                                key={medicine.medicineId}
                                value={medicine.medicineId}
                              >
                                {medicine.medicineName} - Stock: {medicine.stockQuantity}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Dosage *</label>
                        <input
                          type="text"
                          name="dosage"
                          value={prescriptionItemForm.dosage}
                          onChange={handlePrescriptionItemChange}
                          placeholder="e.g. 1 tablet"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Frequency *</label>
                        <input
                          type="text"
                          name="frequency"
                          value={prescriptionItemForm.frequency}
                          onChange={handlePrescriptionItemChange}
                          placeholder="e.g. Twice daily"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Duration *</label>
                        <input
                          type="text"
                          name="duration"
                          value={prescriptionItemForm.duration}
                          onChange={handlePrescriptionItemChange}
                          placeholder="e.g. 5 days"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Quantity *</label>
                        <input
                          type="number"
                          name="quantity"
                          value={prescriptionItemForm.quantity}
                          onChange={handlePrescriptionItemChange}
                          placeholder="Enter quantity"
                          min="1"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Additional Instructions</label>
                        <textarea
                          name="instructions"
                          value={prescriptionItemForm.instructions}
                          onChange={handlePrescriptionItemChange}
                          placeholder="e.g. Take after meals"
                          rows="3"
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        type="submit"
                        className="primary-btn"
                        disabled={prescriptionItemSaving}
                      >
                        <Save size={16} />
                        {prescriptionItemSaving
                          ? "Saving..."
                          : editingPrescriptionItemId
                            ? "Update Medicine"
                            : "Add Medicine"}
                      </button>

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => {
                          setShowMedicineItemForm(false);
                          setEditingPrescriptionItemId(null);
                          setPrescriptionItemForm(emptyPrescriptionItem);
                          setPrescriptionItemError("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Visit ID</th>
                      <th>Date</th>
                      <th>Instructions</th>
                      <th>Medicines</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPrescriptions.length > 0 ? (
                      filteredPrescriptions.map((prescription) => (
                        <tr key={prescription.prescriptionId}>
                          <td>#{prescription.prescriptionId}</td>
                          <td>{prescription.patientName}</td>
                          <td>{prescription.doctorName}</td>
                          <td>#{prescription.visitId}</td>
                          <td>
                            {prescription.prescriptionDate
                              ? new Date(
                                prescription.prescriptionDate
                              ).toLocaleDateString()
                              : "-"}
                          </td>
                          <td>
                            {prescription.instructions || "-"}
                          </td>

                          <td>
                            {prescription.items?.length > 0 ? (
                              <div className="prescription-medicine-list">
                                {prescription.items.map((item) => (
                                  <div
                                    key={item.prescriptionItemId}
                                    className="prescription-medicine-item"
                                  >
                                    <strong>{item.medicineName}</strong>

                                    <p>Dosage: {item.dosage}</p>
                                    <p>Frequency: {item.frequency}</p>
                                    <p>Duration: {item.duration}</p>
                                    <p>Quantity: {item.quantity}</p>

                                    {item.instructions && (
                                      <p>Instructions: {item.instructions}</p>
                                    )}

                                    <button
                                      className="icon-btn edit-btn"
                                      title="Edit prescribed medicine"
                                      onClick={() => openEditPrescriptionItem(item)}
                                    >
                                      <Pencil size={15} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span>No medicines added</span>
                            )}
                          </td>

                          <td>
                            <div className="action-buttons">
                              <button
                                className="icon-btn edit-btn"
                                title="Edit prescription"
                                onClick={() =>
                                  openEditPrescription(prescription)
                                }
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                className="icon-btn"
                                title="Add medicine"
                                onClick={() =>
                                  openAddPrescriptionItem(
                                    prescription.prescriptionId
                                  )
                                }
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="empty-state">
                          No prescriptions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activePage === "Patients" ? (
            <>
              <div className="section-heading">
                <div>
                  <h2>Patients Management</h2>
                  <p>Register, search and manage patient records.</p>
                </div>

                <button
                  className="refresh-btn"
                  onClick={loadPatients}
                  disabled={dataLoading}
                >
                  <RefreshCw size={16} className={dataLoading ? "spin" : ""} />
                  Refresh
                </button>
              </div>

              {patientMessage && (
                <div className="success-message">{patientMessage}</div>
              )}

              {patientError && (
                <div className="error-message">{patientError}</div>
              )}

              {!showPatientForm ? (
                <>
                  <div className="patient-toolbar">
                    <div className="patient-search">
                      <Search size={18} />
                      <input
                        type="text"
                        placeholder="Search by name, phone or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <button className="login-btn add-patient-btn" onClick={openAddPatient}>
                      <Plus size={18} /> Add Patient
                    </button>
                  </div>

                  <section className="table-card">
                    <div className="table-heading">
                      <div>
                        <h2>Patient Records</h2>
                        <p>All registered patients.</p>
                      </div>
                      <span className="record-count">
                        {filteredPatients.length} records
                      </span>
                    </div>

                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Patient Name</th>
                            <th>Gender</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Blood Group</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredPatients.map((patient) => (
                            <tr key={patient.patientId}>
                              <td>#{patient.patientId}</td>
                              <td><strong>{patient.fullName}</strong></td>
                              <td>{patient.gender || "—"}</td>
                              <td>{patient.phone || "—"}</td>
                              <td>{patient.email || "—"}</td>
                              <td>{patient.bloodGroup || "—"}</td>
                              <td>
                                <div className="patient-actions">
                                  <button
                                    className="icon-action edit"
                                    title="Edit patient"
                                    onClick={() => openEditPatient(patient)}
                                  >
                                    <Pencil size={16} />
                                  </button>

                                  {user.role === "Admin" && (
                                    <button
                                      className="icon-action delete"
                                      title="Delete patient"
                                      onClick={() => deletePatient(patient.patientId)}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}

                          {!dataLoading && filteredPatients.length === 0 && (
                            <tr>
                              <td colSpan="7" className="empty-state">
                                No patient records found.
                              </td>
                            </tr>
                          )}

                          {dataLoading && (
                            <tr>
                              <td colSpan="7" className="empty-state">
                                Loading patients...
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              ) : (
                <section className="table-card patient-form-card">
                  <div className="table-heading">
                    <div>
                      <h2>{editingPatientId ? "Edit Patient" : "Register New Patient"}</h2>
                      <p>Enter the patient's information below.</p>
                    </div>
                    <button
                      className="icon-action"
                      onClick={() => setShowPatientForm(false)}
                      title="Close form"
                    >
                      <X size={19} />
                    </button>
                  </div>

                  <form className="patient-form" onSubmit={savePatient}>
                    <div className="patient-form-grid">
                      <div className="patient-field">
                        <label>Full Name *</label>
                        <input
                          name="fullName"
                          value={patientForm.fullName}
                          onChange={handlePatientFormChange}
                          placeholder="Enter full name"
                          required
                        />
                      </div>

                      <div className="patient-field">
                        <label>Gender *</label>
                        <select
                          name="gender"
                          value={patientForm.gender}
                          onChange={handlePatientFormChange}
                          required
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="patient-field">
                        <label>Date of Birth</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={patientForm.dateOfBirth}
                          onChange={handlePatientFormChange}
                        />
                      </div>

                      <div className="patient-field">
                        <label>Phone Number *</label>
                        <input
                          name="phone"
                          value={patientForm.phone}
                          onChange={handlePatientFormChange}
                          placeholder="Enter phone number"
                          required
                        />
                      </div>

                      <div className="patient-field">
                        <label>Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={patientForm.email}
                          onChange={handlePatientFormChange}
                          placeholder="Enter email address"
                        />
                      </div>

                      <div className="patient-field">
                        <label>Blood Group</label>
                        <select
                          name="bloodGroup"
                          value={patientForm.bloodGroup}
                          onChange={handlePatientFormChange}
                        >
                          <option value="">Select blood group</option>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                            <option key={group} value={group}>{group}</option>
                          ))}
                        </select>
                      </div>

                      <div className="patient-field full-width">
                        <label>Address</label>
                        <textarea
                          name="address"
                          value={patientForm.address}
                          onChange={handlePatientFormChange}
                          placeholder="Enter complete address"
                          rows="3"
                        />
                      </div>
                    </div>

                    {patientError && (
                      <div className="error-message">{patientError}</div>
                    )}

                    <div className="patient-form-actions">
                      <button
                        type="button"
                        className="refresh-btn"
                        onClick={() => setShowPatientForm(false)}
                      >
                        <ArrowLeft size={16} /> Cancel
                      </button>

                      <button
                        type="submit"
                        className="login-btn save-patient-btn"
                        disabled={patientSaving}
                      >
                        <Save size={17} />
                        {patientSaving
                          ? "Saving..."
                          : editingPatientId
                            ? "Update Patient"
                            : "Save Patient"}
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </>
          ) : activePage === "Overview" ? (
            <>
              <div className="welcome-banner">
                <div>
                  <p className="banner-label">{config.subtitle.toUpperCase()}</p>
                  <h1>Hello, {user.fullName}!</h1>
                  <p>{config.description}</p>
                </div>
                <div className="banner-icon"><HeartPulse size={54} /></div>
              </div>

              <div className="section-heading">
                <div>
                  <h2>Overview</h2>
                  <p>Here is what's happening in your clinic.</p>
                </div>
                <button className="refresh-btn" onClick={loadDashboard} disabled={dataLoading}>
                  <RefreshCw size={16} className={dataLoading ? "spin" : ""} />
                  Refresh
                </button>
              </div>

              {dataError && <div className="info-message">{dataError}</div>}

              <div className="stats-grid">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div className="stat-card" key={stat.title}>
                      <div className={`stat-icon ${stat.color}`}>
                        <Icon size={23} />
                      </div>
                      <div>
                        <p>{stat.title}</p>
                        <h2>{dataLoading ? "..." : stat.value}</h2>
                      </div>
                    </div>
                  );
                })}
              </div>

              <section className="table-card">
                <div className="table-heading">
                  <div>
                    <h2>Recent Appointments</h2>
                    <p>Latest appointment records from your clinic.</p>
                  </div>
                  <span className="record-count">
                    {dashboardData.appointments.length} records
                  </span>
                </div>

                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.appointments.slice(0, 6).map((appointment) => (
                        <tr key={appointment.appointmentId}>
                          <td>{appointment.patientName || `Patient #${appointment.patientId}`}</td>
                          <td>{appointment.doctorName || `Doctor #${appointment.doctorId}`}</td>
                          <td>{appointment.appointmentDate || "—"}</td>
                          <td>{appointment.appointmentTime || "—"}</td>
                          <td>
                            <span className={`status-badge ${String(appointment.status || "").toLowerCase()}`}>
                              {appointment.status || "Unknown"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {!dataLoading && dashboardData.appointments.length === 0 && (
                        <tr>
                          <td colSpan="5" className="empty-state">
                            No appointments available yet.
                          </td>
                        </tr>
                      )}
                      {dataLoading && (
                        <tr><td colSpan="5" className="empty-state">Loading appointments...</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <section className="table-card">
              <div className="table-heading">
                <div>
                  <h2>{activePage}</h2>
                  <p>This section will be available in the next development step.</p>
                </div>
              </div>
            </section>
          )}

          <p className="footer-note">
            ATH Clinic Management System · Logged in as {user.role}
          </p>
        </section>
      </main >
    </div >
  );
}

export default App;
