import React, { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  get,
  query,
  orderByChild,
  equalTo
} from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import { app } from "../../firebaseConfig.js";
import { v4 as uuid } from "uuid";

import KanbanBoard from "./KanbanBoard";
import NavBar from "./NavBar";
import WorkSiteDetail from "./WorkSiteDetail";
import { ArrowUpRight } from 'lucide-react';

// FAQSection Component
const FAQSection = () => {
  const faqs = [
    {
      question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
      answer:
        "This is the answer for FAQ 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et."
    },
    {
      question: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?",
      answer:
        "This is the answer for FAQ 2. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      question: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris?",
      answer:
        "This is the answer for FAQ 3. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
    }
  ];

  const [openFAQs, setOpenFAQs] = useState(faqs.map(() => false));

  const toggleFAQ = (index) => {
    const newOpenFAQs = [...openFAQs];
    newOpenFAQs[index] = !newOpenFAQs[index];
    setOpenFAQs(newOpenFAQs);
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12" style={{ color: "#0c1526" }}>
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-lg p-4 border overflow-hidden" style={{ backgroundColor: "#f9f9f9", borderColor: "#eee" }}>
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleFAQ(index)}>
                <span className="text-sm" style={{ color: "#0c1526" }}>{faq.question}</span>
                <span className="text-xl" style={{ color: "#bbb" }}>{openFAQs[index] ? "−" : "+"}</span>
              </div>
              <div style={{ maxHeight: openFAQs[index] ? "200px" : "0px", overflow: "hidden", transition: "max-height 0.3s ease" }}>
                <p style={{ padding: openFAQs[index] ? "1rem 0" : "0", margin: 0, color: "#555" }}>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const STATUSES = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "done", label: "Done" }
];

const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

const WorkplaceApp = () => {
  // New functions for navigation on onboarding view
  const handleCreateAccountClick = () => {
    setShowOnboarding(false);
    setIsRegistering(true);
  };

  const handleLoginClick = () => {
    setShowOnboarding(false);
    setIsRegistering(false);
  };

  // STATES
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [siteName, setSiteName] = useState("");
  const [workSites, setWorkSites] = useState(() => {
    const saved = localStorage.getItem("workSites");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSiteIndex, setCurrentSiteIndex] = useState(() => {
    const saved = localStorage.getItem("currentSiteIndex");
    return saved ? JSON.parse(saved) : null;
  });
  const [location, setLocation] = useState(null);
  const [viewableSites, setViewableSites] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editName, setEditName] = useState(""); // Added missing state
  const [teamMembers, setTeamMembers] = useState([
    "employee1@example.com",
    "employee2@example.com"
  ]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  // New state for billing toggle
  const [billing, setBilling] = useState("monthly");
  const fileInputRef = useRef(null);

  // Persist workSites and currentSiteIndex to localStorage
  useEffect(() => {
    localStorage.setItem("workSites", JSON.stringify(workSites));
  }, [workSites]);

  useEffect(() => {
    localStorage.setItem("currentSiteIndex", JSON.stringify(currentSiteIndex));
  }, [currentSiteIndex]);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setShowOnboarding(false); // Hide onboarding when logged in
        get(ref(database, `users/${user.uid}`)).then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setRole(userData.role);
            setFirstName(userData.firstName);
            setLastName(userData.lastName);
            setCompanyName(userData.companyName);
          }
        });
      } else {
        setUser(null);
        setRole("");
        setFirstName("");
        setLastName("");
        setCompanyName("");
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  // Fetch viewable work sites when user/companyName changes
  useEffect(() => {
    if (user) {
      const sitesRef = query(
        ref(database, "workSites"),
        orderByChild("company"),
        equalTo(companyName)
      );
      get(sitesRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const sites = Object.values(snapshot.val());
            setViewableSites(sites);
          } else {
            setViewableSites([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching work sites:", error);
          setViewableSites([]);
        });
    }
  }, [user, companyName]);

  // Google Sign-In
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        const newUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: "employee",
          firstName: user.displayName.split(" ")[0],
          lastName: user.displayName.split(" ")[1] || "",
          companyName: ""
        };
        await set(userRef, newUser);
        console.log("New user created in the database.");
      } else {
        console.log("User already exists in the database.");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  // Email Sign-In
  const handleEmailSignIn = async () => {
    setErrorMessage("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Sign In Error:", error);
      setErrorMessage("Invalid email or password.");
    }
  };

  // Email Registration
  const handleEmailRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      console.log("Verification email sent!");
      await set(ref(database, `users/${user.uid}`), {
        uid: user.uid,
        email: email,
        role: "employee",
        firstName: firstName,
        lastName: lastName,
        companyName: companyName
      });
      alert("Registration successful! Please verify your email.");
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Registration failed. Please try again.");
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // File handling
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!currentSite) {
      alert("Please select a work site first.");
      return;
    }
    const uploadPromises = files.map(async (file) => {
      const storagePath = `sitePhotos/${user.uid}/${currentSite.id}/${file.name}`;
      const fileRefStorage = storageRef(storage, storagePath);
      const snapshot = await uploadBytes(fileRefStorage, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return {
        name: file.name,
        url: downloadURL,
        path: storagePath
      };
    });
    try {
      const newPhotos = await Promise.all(uploadPromises);
      setWorkSites((prev) => {
        const updatedSites = [...prev];
        const siteIndex = updatedSites.findIndex((s) => s.id === currentSite.id);
        if (siteIndex !== -1) {
          updatedSites[siteIndex].photos = [
            ...(updatedSites[siteIndex].photos || []),
            ...newPhotos
          ];
        }
        return updatedSites;
      });
    } catch (error) {
      console.error("File Upload Error:", error);
      alert("Failed to upload photos.");
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  // Work site management
  const addWorkSite = () => {
    if (!siteName) return;
    const newSite = {
      id: `site-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: siteName,
      photos: [],
      status: "todo",
      assignedTo: "",
      comment: ""
    };
    setWorkSites((prev) => [...prev, newSite]);
    setSiteName("");
  };

  const removeWorkSite = (index) => {
    setWorkSites((prev) => prev.filter((_, i) => i !== index));
  };

  const updateWorkSite = (index) => {
    setWorkSites((prev) => {
      const updatedSites = [...prev];
      updatedSites[index] = { ...updatedSites[index], name: editName };
      return updatedSites;
    });
    setEditingIndex(null);
  };

  const handleAssign = (e) => {
    const assignedTo = e.target.value;
    setWorkSites((prev) => {
      const updatedSites = [...prev];
      if (updatedSites[currentSiteIndex]) {
        updatedSites[currentSiteIndex].assignedTo = assignedTo;
      }
      return updatedSites;
    });
  };

  const updateSiteComment = (comment) => {
    setWorkSites((prev) => {
      const updatedSites = [...prev];
      if (updatedSites[currentSiteIndex]) {
        updatedSites[currentSiteIndex].comment = comment;
      }
      return updatedSites;
    });
  };

  const deletePhoto = (index) => {
    setWorkSites((prev) => {
      const updatedSites = [...prev];
      if (
        updatedSites[currentSiteIndex] &&
        updatedSites[currentSiteIndex].photos
      ) {
        updatedSites[currentSiteIndex].photos = updatedSites[currentSiteIndex].photos.filter(
          (_, i) => i !== index
        );
      }
      return updatedSites;
    });
    setSelectedPhotoIndex(null);
  };

  const goLeft = () => {
    setSelectedPhotoIndex((prev) => (prev && prev > 0 ? prev - 1 : prev));
  };

  const goRight = () => {
    if (currentSite && currentSite.photos) {
      setSelectedPhotoIndex((prev) =>
        prev !== null && prev < currentSite.photos.length - 1 ? prev + 1 : prev
      );
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 }
    })
  );

  const currentSite =
    currentSiteIndex !== null ? workSites[currentSiteIndex] : null;

  const handleUpdateStatus = (id, status) => {
    setWorkSites((prev) => {
      const updatedSites = [...prev];
      const siteIndex = updatedSites.findIndex((site) => site.id === id);
      if (siteIndex !== -1) {
        updatedSites[siteIndex].status = status;
        if (status === "in-progress" && !updatedSites[siteIndex].startTime) {
          updatedSites[siteIndex].startTime = new Date().toISOString();
        } else if (status === "done" && !updatedSites[siteIndex].doneTime) {
          updatedSites[siteIndex].doneTime = new Date().toISOString();
        }
      }
      return updatedSites;
    });

    // Trigger a notification when the task is moved to in-progress or done
    if (status === "in-progress" || status === "done") {
      setNotifications((prev) => prev + 1);
      // Optionally, you can also integrate a push notification service here
    }
  };

  const handleUpdateDescription = (id, description) => {
    setWorkSites((prev) => {
      const updatedSites = [...prev];
      const siteIndex = updatedSites.findIndex((site) => site.id === id);
      if (siteIndex !== -1) {
        updatedSites[siteIndex].comment = description;
      }
      return updatedSites;
    });
  };

  // Added missing handleAddTask to avoid errors in KanbanBoard
  const handleAddTask = (column) => {
    if (!siteName) return;
    const newSite = {
      id: `site-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: siteName,
      photos: [],
      status: column,
      assignedTo: "",
      comment: ""
    };
    if (column === "in-progress") {
      newSite.startTime = new Date().toISOString();
    }
    if (column === "done") {
      newSite.startTime = new Date().toISOString();
      newSite.doneTime = new Date().toISOString();
    }
    setWorkSites((prev) => [...prev, newSite]);
    setSiteName("");
  };

  // Prepare tasks for the Kanban board
  const { todoTasks, inProgressTasks, doneTasks } = (() => {
    const todoTasks = workSites
      .filter((site) => site.status === "todo")
      .map((site) => ({
        id: site.id,
        title: site.name,
        assignedTo: site.assignedTo
      }));
    const inProgressTasks = workSites
      .filter((site) => site.status === "in-progress")
      .map((site) => ({
        id: site.id,
        title: site.name,
        startTime: site.startTime ? new Date(site.startTime).toLocaleTimeString() : undefined,
        assignedTo: site.assignedTo
      }));
    const doneTasks = workSites
      .filter((site) => site.status === "done")
      .map((site) => ({
        id: site.id,
        title: site.name,
        startTime: site.startTime ? new Date(site.startTime).toLocaleTimeString() : undefined,
        finishTime: site.doneTime ? new Date(site.doneTime).toLocaleTimeString() : undefined,
        assignedTo: site.assignedTo
      }));
    return { todoTasks, inProgressTasks, doneTasks };
  })();

  // While checking authentication, show a loader
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Onboarding view (if user is not logged in)
  if (!user) {
    if (showOnboarding) {
      return (
        <div className="min-h-screen w-full font-sans">
          {/* NAVBAR */}
          <div style={{ backgroundColor: "#0c1526", padding: "1rem 0" }}>
            <nav
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "1rem",
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "0.75rem 1.5rem",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ color: "#37cb7e", fontSize: "1.25rem", fontWeight: "bold" }}>
                  CheckMateGo
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button
                  onClick={handleLoginClick}
                  style={{
                    backgroundColor: "#D3D3D3",
                    color: "#000000",
                    fontSize: "0.75rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    border: "none"
                  }}
                >
                  LOGIN
                </button>
                <button
                  onClick={handleCreateAccountClick}
                  style={{
                    backgroundColor: "#333333",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    border: "none"
                  }}
                >
                  FREE TRIAL
                </button>
              </div>
            </nav>
          </div>

          {/* HERO SECTION */}
          <section style={{ position: "relative", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "75%",
                backgroundColor: "#0c1526",
                borderBottomLeftRadius: "40% 60px",
                borderBottomRightRadius: "40% 60px"
              }}
            />
            <div style={{ position: "relative", zIndex: 1, color: "#ffffff", padding: "4rem 0" }}>
              <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#ffffff" }}>
                  Take Control of Your Job Site Photos <br className="hidden md:block" />
                  and Project Tracking from Anywhere <br className="hidden md:block" />
                  with{" "}
                  <span style={{ display: "inline-block", position: "relative", color: "#ffffff" }}>
                    CheckMateGo
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: "2px",
                        height: "10px",
                        backgroundColor: "#37cb7e",
                        zIndex: -1,
                        borderRadius: "2px"
                      }}
                    />
                  </span>
                  .
                </h1>
                <p className="text-sm md:text-base max-w-2xl mx-auto mb-8" style={{ color: "#ffffff" }}>
                  Easily Track, Measure, Share, and Report in real-time
                </p>
                <button
                  onClick={handleCreateAccountClick}
                  style={{ backgroundColor: "#37cb7e", color: "#ffffff" }}
                  className="mx-auto mt-4 px-6 py-3 rounded-md hover:bg-[#2fb86f] transition-colors text-sm font-medium flex items-center gap-2"
                >
                  GET STARTED FOR FREE <ArrowUpRight className="h-4 w-4" />
                </button>
                {/* Onboarding Photo */}
                <div
                  className="mx-auto mt-8 border-4 rounded-3xl overflow-hidden shadow-lg"
                  style={{ borderColor: "#37cb7e", backgroundColor: "#ffffff", width: "800px", height: "500px", marginTop: "2rem" }}
                >
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #f7f7f7,rgb(172, 208, 176))",
                      color: "#808080",
                    }}
                  >
                    <span>Onboarding Photo</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STEPS SECTION */}
          <section style={{ backgroundColor: "#f9f9f9", padding: "4rem 1rem" }}>
            <div style={{ maxWidth: "80rem", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
              {/* STEP 1 */}
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "5rem", height: "5rem", borderRadius: "50%", border: "3px solid #37cb7e", backgroundColor: "#ffffff", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}>
                  <span style={{ color: "#000000", fontWeight: "bold", fontSize: "1.5rem" }}>1</span>
                </div>
                <h3 style={{ color: "#0c1526", fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>Free Trial</h3>
                <p style={{ color: "#555555", fontSize: "0.875rem", margin: "0 auto", maxWidth: "200px" }}>Sign up for free and explore the core features right away.</p>
              </div>
              {/* STEP 2 */}
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "5rem", height: "5rem", borderRadius: "50%", border: "3px solid #37cb7e", backgroundColor: "#ffffff", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}>
                  <span style={{ color: "#000000", fontWeight: "bold", fontSize: "1.5rem" }}>2</span>
                </div>
                <h3 style={{ color: "#0c1526", fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>Take Photos</h3>
                <p style={{ color: "#555555", fontSize: "0.875rem", margin: "0 auto", maxWidth: "200px" }}>Capture and upload site photos in real-time for better visibility.</p>
              </div>
              {/* STEP 3 */}
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "5rem", height: "5rem", borderRadius: "50%", border: "3px solid #37cb7e", backgroundColor: "#ffffff", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}>
                  <span style={{ color: "#000000", fontWeight: "bold", fontSize: "1.5rem" }}>3</span>
                </div>
                <h3 style={{ color: "#0c1526", fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>Real Time Progress</h3>
                <p style={{ color: "#555555", fontSize: "0.875rem", margin: "0 auto", maxWidth: "200px" }}>Monitor updates, track tasks, and collaborate seamlessly.</p>
              </div>
            </div>
          </section>

          {/* SCREENSHOT / TRY SECTION */}
          <section className="bg-gradient-to-b from-[#0c1526] to-[#15202e] text-white py-16 px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-medium mb-4">
                  <span style={{ color: "#000000" }}>Try</span>{" "}
                  <span style={{ display: "inline-block", position: "relative", color: "#000000" }}>
                    CheckMateGo
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: "2px",
                        height: "10px",
                        backgroundColor: "#37cb7e",
                        zIndex: -1,
                        borderRadius: "2px"
                      }}
                    />
                  </span>{" "}
                  <span style={{ color: "#000000" }}>For Free</span>
                </h2>
                <p style={{ color: "#000000" }} className="text-sm mb-6">
                  Discover effortless job site management, real-time updates, and streamlined photo tracking.
                </p>
                <button
                  onClick={handleCreateAccountClick}
                  style={{ backgroundColor: "#37cb7e", color: "#ffffff" }}
                  className="px-6 py-2 rounded-md hover:bg-[#2fb86f] transition-colors text-sm font-medium"
                >
                  Get Started
                </button>
              </div>
              <div className="border-4 rounded-3xl overflow-hidden shadow-lg" style={{ borderColor: "#37cb7e", backgroundColor: "#fff" }}>
                <div className="w-full h-56 flex items-center justify-center" style={{ backgroundColor: "#f0f0f0" }}>
                  <span className="text-gray-500">Application Screenshot</span>
                </div>
              </div>
            </div>
          </section>

          {/* PRICING SECTION */}
          <section className="py-16 px-4" style={{ backgroundColor: "#e9f7f1" }}>
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-12" style={{ color: "#0c1526" }}>
                Pricing Plan
              </h2>
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => setBilling("monthly")}
                  style={{
                    backgroundColor: billing === "monthly" ? "#37cb7e" : "#f7f7f7",
                    color: billing === "monthly" ? "#ffffff" : "#000000",
                    padding: "0.5rem 1rem",
                    borderTop: "1px solid #ccc",
                    borderBottom: "1px solid #ccc",
                    borderLeft: "1px solid #ccc",
                    borderRadius: "0.375rem 0 0 0.375rem",
                    transition: "all 0.3s ease",
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  style={{
                    backgroundColor: billing === "yearly" ? "#37cb7e" : "#f7f7f7",
                    color: billing === "yearly" ? "#ffffff" : "#000000",
                    padding: "0.5rem 1rem",
                    borderTop: "1px solid #ccc",
                    borderBottom: "1px solid #ccc",
                    borderRight: "1px solid #ccc",
                    borderRadius: "0 0.375rem 0.375rem 0",
                    transition: "all 0.3s ease",
                  }}
                >
                  Yearly
                </button>
              </div>

              <div className="flex justify-center gap-4">
                {/* Starter */}
                <div className="rounded-lg shadow-sm border overflow-hidden flex-shrink-0" style={{ backgroundColor: "#fff", borderColor: "#ccc", width: "300px", height: "400px" }}>
                  <div className="p-6">
                    <p className="text-sm mb-2" style={{ color: "#888" }}>Starter</p>
                    <div className="flex items-baseline justify-center mb-4">
                      <span className="text-3xl font-bold" style={{ color: "#0c1526" }}>
                        {billing === "monthly" ? "$39.99" : "$29.99"}
                      </span>
                      <span className="text-xs ml-2" style={{ color: "#999" }}>
                        {billing === "monthly" ? "/month" : "/year"}
                      </span>
                    </div>
                    <p className="text-xs mb-6" style={{ color: "#888" }}>Ideal for small teams just getting started.</p>
                    <button
                      onClick={handleCreateAccountClick}
                      className="w-full py-2 rounded transition text-sm font-medium"
                      style={{ backgroundColor: "transparent", border: "1px solid #37cb7e", color: "#37cb7e" }}
                    >
                      GET STARTED
                    </button>
                  </div>
                </div>
                {/* Professional */}
                <div className="rounded-lg shadow-lg relative transform scale-105 z-10 overflow-hidden flex-shrink-0" style={{ backgroundColor: "#37cb7e", width: "300px", height: "400px" }}>
                  <div className="p-6">
                    <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.8)" }}>Professional</p>
                    <div className="flex items-baseline justify-center mb-4">
                      <span className="text-3xl font-bold" style={{ color: "#fff" }}>
                        {billing === "monthly" ? "$59.99" : "$44.99"}
                      </span>
                      <span className="text-xs ml-2" style={{ color: "rgba(255,255,255,0.7)" }}>
                        {billing === "monthly" ? "/month" : "/year"}
                      </span>
                    </div>
                    <p className="text-xs mb-6" style={{ color: "rgba(255,255,255,0.7)" }}>Great for growing teams that need advanced features.</p>
                    <button
                      onClick={handleCreateAccountClick}
                      className="w-full py-2 rounded transition text-sm font-medium"
                      style={{ backgroundColor: "#fff", color: "#37cb7e" }}
                    >
                      GET STARTED
                    </button>
                  </div>
                </div>
                {/* Enterprise */}
                <div className="rounded-lg shadow-sm border overflow-hidden flex-shrink-0" style={{ backgroundColor: "#fff", borderColor: "#ccc", width: "300px", height: "400px" }}>
                  <div className="p-6">
                    <p className="text-sm mb-2" style={{ color: "#888" }}>Enterprise</p>
                    <div className="flex items-baseline justify-center mb-4">
                      <span className="text-3xl font-bold" style={{ color: "#0c1526" }}>
                        Custom
                      </span>
                      <span className="text-xs ml-2" style={{ color: "#999" }}>
                        {billing === "monthly" ? "/month" : "/year"}
                      </span>
                    </div>
                    <p className="text-xs mb-6" style={{ color: "#888" }}>Perfect for large organizations needing unlimited features.</p>
                    <button
                      onClick={handleCreateAccountClick}
                      className="w-full py-2 rounded transition text-sm font-medium"
                      style={{ backgroundColor: "transparent", border: "1px solid #37cb7e", color: "#37cb7e" }}
                    >
                      GET STARTED
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ SECTION */}
          <FAQSection />

          {/* FINAL CTA FOOTER */}
          <section className="py-20 text-center" style={{ backgroundColor: "#37cb7e", color: "#fff" }}>
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="mb-6">Sign up today for free!</p>
            <button
              onClick={handleCreateAccountClick}
              className="px-6 py-3 rounded-md font-medium transition-colors"
              style={{ backgroundColor: "#fff", color: "#37cb7e" }}
            >
              Get Started
            </button>
          </section>
        </div>
      );
    } else {
      // Login/Register view
      return (
        <div className="min-h-screen flex">
          <div className="w-full md:w-2/5 bg-white p-8 flex flex-col justify-center items-center">
            <button
              onClick={() => setShowOnboarding(true)}
              style={{ color: "#37cb7e" }}
              className="text-sm hover:underline mb-4 self-start"
            >
              ← Back to Welcome
            </button>
            <div className="max-w-sm mx-auto my-auto">
            <h1 style={{ color: "#37cb7e" }} className="text-xl font-bold mb-8 text-center">CheckMateGo</h1>
              {isRegistering ? (
                <>
                  <h2 className="text-2xl font-bold mb-2 text-center">Create an Account</h2>
                  <p className="text-sm text-gray-500 mb-6 text-center">
                    Already have an account?{" "}
                    <button
                      onClick={() => setIsRegistering(false)}
                      style={{ color: "#37cb7e" }}
                      className="hover:underline"
                    >
                      Sign In
                    </button>
                  </p>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
<button
  onClick={handleEmailRegister}
  style={{ color: "#ffffff" }}
  className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 text-sm mb-4 self-start"
>
  Create Account
</button>

                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2 text-center">Sign In</h2>
                  <p className="text-sm text-gray-500 mb-6 text-center">
                    Don’t have an account?{" "}
                    <button onClick={() => setIsRegistering(true)} style={{ color: "#37cb7e" }} className="text-sm hover:underline mb-4 self-start">
                      Create Account
                    </button>
                  </p>
                  <div className="space-y-4">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                    {errorMessage && (
                      <p className="text-sm mt-1" style={{ color: "red" }}>{errorMessage}</p>
                    )}
                    <div className="flex justify-end text-sm mb-2">
                      <button className="text-gray-500 hover:underline">Forgot Password?</button>
                    </div>
                    <button
                      onClick={handleEmailSignIn}
                      className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90"
                    >
                      Sign In
                    </button>
                    <div className="flex items-center justify-center my-2">
                      <hr className="w-1/3 border-gray-300" />
                      <span className="mx-2 text-gray-400 text-sm">OR</span>
                      <hr className="w-1/3 border-gray-300" />
                    </div>
                    <button
                      onClick={signInWithGoogle}
                      className="w-full border border-gray-300 text-sm py-2 rounded-md hover:bg-gray-50"
                    >
                      Continue with Google
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:flex w-3/5 flex-col bg-primary text-white p-8 relative items-center justify-center">
            <div className="flex justify-end w-full mb-4"></div>
            <div className="flex flex-col justify-center px-8">
              <div className="bg-white text-primary p-4 rounded-md mb-6">
                <span className="block text-center font-semibold" style={{ color: "#37cb7e" }}>CheckMateGo</span>
              </div>
              <h5 className="text-xl font-semibold mt-4 mb-2 text-center">
                Easily track employee progress and job completion in one place.
              </h5>
              <p className="text-sm text-gray-100 text-center">
                Stay organized and in control—monitor job updates, manage teams, and ensure tasks are completed on time.
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  // Main application view for logged-in users (work sites and tasks)
  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-background to-secondary/50">
      <NavBar
        userName={
          firstName ||
          (user?.displayName ? user.displayName.split(" ")[0] : "") ||
          user?.email
        }
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 pt-24">
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-inprogress rounded-full blur-lg opacity-20 animate-float"></div>
              <h1 className="text-3xl font-bold relative">
                Welcome,{" "}
                {firstName ||
                  (user?.displayName && user.displayName.split(" ")[0]) ||
                  "User"}
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground mt-2">
            Manage your work sites and tasks efficiently
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="glass-card p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4">Add Work Site</h2>
              <div className="flex">
                <input
                  type="text"
                  placeholder="New work site name"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addWorkSite();
                  }}
                  className="rounded-l-lg border-r-0 bg-background border-border/60 py-2 px-3 text-sm flex-grow"
                />
                <button
                  onClick={addWorkSite}
                  className="rounded-r-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="glass-card p-4">
              <h2 className="text-xl font-semibold mb-4">Work Sites</h2>
              <div className="space-y-2">
                {workSites.map((site, idx) => (
                  <div
                    key={site.id || idx}
                    className={`p-3 border border-border/60 rounded-lg ${currentSiteIndex === idx
                      ? "bg-primary/10 border-primary/30"
                      : "bg-background/80"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div
                        className="flex items-center space-x-2 cursor-pointer flex-grow py-1"
                        onClick={() => setCurrentSiteIndex(idx)}
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${site.status === "todo"
                            ? "bg-todo"
                            : site.status === "in-progress"
                              ? "bg-inprogress"
                              : "bg-done"
                            }`}
                        />
                        <span>{site.name}</span>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setEditingIndex(idx);
                            setEditName(site.name);
                          }}
                          className="p-1 text-muted-foreground hover:text-foreground rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeWorkSite(idx)}
                          className="p-1 text-muted-foreground hover:text-destructive rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {editingIndex === idx && (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-grow rounded-md border-border/60 py-1 px-2 text-sm"
                        />
                        <button
                          onClick={() => updateWorkSite(idx)}
                          className="py-1 px-3 rounded-md text-sm bg-primary text-primary-foreground"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {currentSite ? (
              <WorkSiteDetail
                site={currentSite}
                onUpdateStatus={handleUpdateStatus}
                onUpdateDescription={handleUpdateDescription}
                onChooseFile={handleChooseFile}
                onFileChange={handleFileChange}
                fileInputRef={fileInputRef}
              />
            ) : (
              <div className="h-40 flex items-center justify-center border border-dashed border-border rounded-xl mb-6">
                <p className="text-muted-foreground">Select a work site to view details</p>
              </div>
            )}

            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-4">Task Board</h2>
              <KanbanBoard
                todoTasks={todoTasks}
                inProgressTasks={inProgressTasks}
                doneTasks={doneTasks}
                onAddTask={handleAddTask}
              />
            </div>
          </div>
        </div>
      </main>

      {selectedPhotoIndex !== null &&
        currentSite &&
        currentSite.photos &&
        currentSite.photos.length > 0 && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="relative w-4/5 h-4/5 flex items-center justify-center">
              <img
                src={currentSite.photos[selectedPhotoIndex].url}
                alt={`Photo ${selectedPhotoIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedPhotoIndex(null)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
              {selectedPhotoIndex > 0 && (
                <button
                  onClick={goLeft}
                  className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 text-white border-none rounded-full w-10 h-10 flex items-center justify-center"
                >
                  ←
                </button>
              )}
              {selectedPhotoIndex < currentSite.photos.length - 1 && (
                <button
                  onClick={goRight}
                  className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 text-white border-none rounded-full w-10 h-10 flex items-center justify-center"
                >
                  →
                </button>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default WorkplaceApp;
