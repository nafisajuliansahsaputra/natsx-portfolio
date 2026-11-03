export type EngineeringSection = { heading: string; paragraphs: string[]; points?: string[] };
export type EngineeringNote = {
  slug: string;
  projectSlug: string;
  title: string;
  seoTitle: string;
  description: string;
  summary: string;
  year: string;
  category: string;
  stack: string[];
  sourceUrl: string;
  topics: string[];
  sections: EngineeringSection[];
};
/**
 * Editorial engineering notes authored from public project documentation.
 * Keep technical statements aligned with the corresponding repositories.
 * These are explanatory case studies, not AI-generated placeholder routes.
 */
export const engineeringNotes: EngineeringNote[] = [
  {
    "slug": "rfid-face-verification-attendance-system",
    "projectSlug": "smart-attendance-system",
    "title": "Designing an RFID + Face Verification Attendance System",
    "seoTitle": "RFID and Face Verification: Attendance System Architecture",
    "description": "A source-backed engineering deep dive into RFID identity resolution, 1:1 face verification, attendance session rules, and idempotent persistence.",
    "summary": "An RFID scan identifies a card, not necessarily the person holding it. This case study examines how to keep verification, session policy, and persistence under one server-authoritative attendance decision.",
    "year": "2025",
    "category": "Authentication, devices & data integrity",
    "stack": [
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "Supabase",
      "Python",
      "FastAPI",
      "OpenCV"
    ],
    "sourceUrl": "https://github.com/nafisajuliansahsaputra/attendance-system",
    "topics": [
      "RFID",
      "1:1 face verification",
      "attendance system",
      "FastAPI",
      "PostgreSQL",
      "idempotency"
    ],
    "sections": [
      {
        "heading": "The underlying problem: a scan is not an attendance record",
        "paragraphs": [
          "Reading an RFID card is only the beginning of an attendance attempt. The card resolves an expected identity, but it does not prove that the student assigned to that card is physically present. The system also needs to decide which attendance session is active, whether the student is eligible for that session, and whether an earlier attempt was already accepted.",
          "Treating every scan as a completed database write would blur identity, scheduling, and persistence into one fragile action. The architecture instead places an authoritative attendance engine between the device input and the stored result. A web simulator and a hardware-facing Device API must both pass through the same business rules."
        ]
      },
      {
        "heading": "Why 1:1 face verification follows RFID",
        "paragraphs": [
          "A broad face search across every student is not necessary after RFID has supplied a candidate identity. The verification flow uses the card to resolve the expected student, then checks that particular identity through a private Python service built with FastAPI and OpenCV YuNet and SFace.",
          "This separation makes the trust boundary explicit: the browser or device sends an attempt, the biometric service returns verification information, and the application server decides whether attendance can be finalized. A successful face comparison alone does not override scheduling, eligibility, or duplicate-attempt policy."
        ],
        "points": [
          "RFID supplies the expected student identity.",
          "A short-lived verification transaction connects the attempt to its expected subject.",
          "The private verifier performs the 1:1 facial check.",
          "The server combines verification with attendance-session and authorization rules."
        ]
      },
      {
        "heading": "Retries should not create duplicate attendance",
        "paragraphs": [
          "Device networks are imperfect. A scan request can time out after the server has already processed it, and the sender may retry without knowing the earlier outcome. An attendance system must distinguish a retry of the same operation from a new event.",
          "The project uses an atomic, idempotent attendance-finalization path to prevent repeated submissions from writing duplicate attendance. The important design lesson is that the uniqueness and finalization rules belong at the persistence boundary, not just in button disabling or an in-memory client flag."
        ]
      },
      {
        "heading": "Failure feedback is part of the security design",
        "paragraphs": [
          "A camera that fails to obtain a usable face is not the same event as a confirmed identity mismatch. Conflating these conditions would make device feedback misleading to staff and students.",
          "The documented hardware contract distinguishes accepted verification from proxy-attendance rejection, including different LED and buzzer feedback. No-face and poor camera-quality cases are intentionally treated separately. That distinction gives operators a more actionable signal without presenting every sensor failure as an accusation."
        ]
      },
      {
        "heading": "What the implementation demonstrates",
        "paragraphs": [
          "The project connects a Next.js application, PostgreSQL and Supabase data policies, role-based staff workflows, a private FastAPI verification service, and device-facing APIs. Reports are derived from canonical attendance data rather than independent client counters.",
          "The source repository documents the system boundaries, RFID and camera behavior, server authorization, and test coverage in Vitest and pytest. The implementation is useful as a reference for designing trustworthy hardware-assisted workflows, not as a claim that biometric matching is infallible."
        ]
      }
    ]
  },
  {
    "slug": "laravel-document-workflow-rbac",
    "projectSlug": "bast-management-system",
    "title": "Building an Auditable Laravel Document Workflow",
    "seoTitle": "Laravel RBAC, PDF Generation and Document Lifecycle Design",
    "description": "How a Laravel document-management project handles role-based authorization, document state transitions, PDF output, audit records, and safe recruiter demos.",
    "summary": "A document system is more than a CRUD form. Finalization, revision, archival, authorization, and PDF output must all agree on the same record state.",
    "year": "2024",
    "category": "Laravel, business workflows & authorization",
    "stack": [
      "Laravel",
      "PHP",
      "React",
      "TypeScript",
      "Inertia.js",
      "MySQL",
      "Pest"
    ],
    "sourceUrl": "https://github.com/nafisajuliansahsaputra/bast",
    "topics": [
      "Laravel",
      "RBAC",
      "document management",
      "PDF generation",
      "audit logging",
      "workflow"
    ],
    "sections": [
      {
        "heading": "From editable forms to a controlled document lifecycle",
        "paragraphs": [
          "A Berita Acara Serah Terima (BAST) records a handover between parties. In software, the challenge is not merely saving the form fields; it is preserving what the record means after a user finalizes it, revises it, completes the handover, or archives it.",
          "The project models Draft, Finalized, Completed, and Archived as meaningful states. Reopening, revision, cancellation, and restoration are separate workflow operations. This makes the distinction between an editable draft and an accountable completed record visible in application logic instead of leaving each screen to interpret status independently."
        ]
      },
      {
        "heading": "Permissions must be enforced beyond the interface",
        "paragraphs": [
          "Hiding an action in React is helpful usability, not authorization. The backend still receives direct HTTP requests, so every sensitive lifecycle operation needs a server-side check against the current user's role and capabilities.",
          "The Laravel application enforces these boundaries for administrative and staff workflows. Frontend navigation can reflect permissions, but it cannot grant them. This is important for document changes, attachments, user management, and restoration of archived records.",
          "UUID route identifiers reduce accidental exposure of sequential database IDs in URLs. They are not a substitute for authorization: an unguessable identifier still requires ownership and permission checks before a record can be read or modified."
        ]
      },
      {
        "heading": "Numbering, files, and PDFs belong to the domain",
        "paragraphs": [
          "A finalized handover document needs consistent numbering and output. The implementation uses dedicated sequence records for automatic BAST numbers and server-side DomPDF generation for export. Number assignment therefore follows application rules rather than relying on browser-generated values.",
          "Attachments have their own validation, relationship checks, download authorization, and deletion behavior. Treating a file as an authorized document resource matters as much as protecting the database row that references it."
        ],
        "points": [
          "Document information and parties are collected through a structured multi-step workflow.",
          "State transitions determine whether revisions and cancellation are allowed.",
          "Document numbering follows backend-managed sequences.",
          "PDF output is rendered from server-controlled record data.",
          "Audit records preserve contextual change history."
        ]
      },
      {
        "heading": "Auditing means explaining what changed",
        "paragraphs": [
          "For operational records, a changed status without a reason or trace is difficult to trust. The documented activity log records the resource and before/after values alongside contextual details such as actor-related request information, IP address, user agent, and timestamp.",
          "The goal is traceability: staff should be able to connect a document's current state with the series of permitted actions that produced it. Audit trails also help developers debug surprising transitions without treating the client interface as the source of truth."
        ]
      },
      {
        "heading": "A demo should be inspectable without exposing real records",
        "paragraphs": [
          "This project originated during a 2024 internship at Diskominfo Kabupaten Cianjur. The public portfolio repository and hosted demo are not an official production system or institutional repository.",
          "The recruiter demo is intentionally read-only and uses synthetic data. This keeps the document workflow inspectable without publishing operational records or privileged credentials. The repository also documents quality checks including Pest tests, static analysis, and front-end validation."
        ]
      }
    ]
  },
  {
    "slug": "android-windows-gamepad-connection-recovery",
    "projectSlug": "natsx-controller",
    "title": "Designing a Phone-to-Windows Gamepad That Recovers from Disconnects",
    "seoTitle": "Android to Windows Gamepad: Protocol and Connection Recovery",
    "description": "Engineering analysis of Android multi-touch gamepad state, a Kotlin/C# protocol, Wi-Fi and Bluetooth transport, automatic handover, and Windows input safety.",
    "summary": "A controller must not leave a trigger pressed because a packet was lost. NATSX Controller separates the touch surface, transport health, and Windows virtual-controller state.",
    "year": "2026",
    "category": "Android, Windows & realtime protocols",
    "stack": [
      "Kotlin",
      "C#",
      ".NET",
      "WPF",
      "UDP",
      "Bluetooth"
    ],
    "sourceUrl": "https://github.com/nafisajuliansahsaputra/natsx-controller",
    "topics": [
      "Android controller",
      "Windows gamepad",
      "Kotlin",
      "C#",
      "UDP",
      "Bluetooth",
      "protocol design"
    ],
    "sections": [
      {
        "heading": "The hardest problem is maintaining state",
        "paragraphs": [
          "A phone can draw buttons and joysticks, but a useful Windows gamepad has to deal with several touches at once, dropped packets, and rapid changes in connection quality. Sending independent button-down and button-up messages can leave the receiver with stale input if one event never arrives.",
          "NATSX Controller treats gamepad input as a complete state snapshot instead of trusting every event in isolation. A shared transport-independent GamepadState model lets the Kotlin Android client and the C# Windows receiver reason about the same buttons, sticks, and triggers."
        ]
      },
      {
        "heading": "Multi-touch requires independent input ownership",
        "paragraphs": [
          "A player may move a joystick while holding a shoulder button and tapping a face button. A single global touch coordinate would lose track of which finger owns which control.",
          "The Android layer keeps pointer ownership independent across interactive controls. That design supports simultaneous stick, D-pad, trigger, shoulder, and face-button input without collapsing them into one pointer stream. The input layer emits state; it does not decide how networking should carry that state."
        ]
      },
      {
        "heading": "A protocol should survive late and duplicated packets",
        "paragraphs": [
          "A realtime transport may reorder or duplicate data. The Windows receiver therefore cannot assume that the most recently received packet represents the newest state. The documented protocol includes sequencing and integrity checks as part of authenticated local session semantics.",
          "Stale or duplicate state is rejected. A watchdog can return the controller to neutral input when valid updates stop arriving, reducing stuck-button risk after a disconnect. This is a safety behavior, not merely a network performance optimization."
        ]
      },
      {
        "heading": "Selecting a transport without connection thrashing",
        "paragraphs": [
          "The connection design considers USB Direct, Wi-Fi, and Bluetooth as possible carriers of the same gamepad state. The preferred order is USB Direct, then Wi-Fi, then Bluetooth, but preference alone is not enough to justify switching while play is underway.",
          "The Smart Connection Manager also weighs latency, jitter, packet loss, silence, cooldowns, hysteresis, and failure history. Only one transport is authoritative at a time, and a candidate must be evaluated before takeover. Otherwise, small network fluctuations could trigger repeated handovers and unstable input."
        ],
        "points": [
          "Keep input state independent of the connection implementation.",
          "Evaluate transport health instead of relying only on a fixed priority.",
          "Reject late and duplicate snapshots.",
          "Neutralize Windows input after loss of authoritative updates.",
          "Keep the virtual-controller lifecycle separate from connection reconnects."
        ]
      },
      {
        "heading": "What the source verifies, and what it does not promise",
        "paragraphs": [
          "The project includes native Android input work, a .NET/WPF Windows receiver, cross-language protocol fixtures, and deterministic connection-policy testing. The documented engineering scope includes USB Direct work as well as Wi-Fi and Bluetooth connectivity.",
          "USB integration can depend on Windows drivers and device-specific constraints. The case study describes the architecture and implemented verification scope; it is not a claim that every Android phone and every unsigned Windows driver combination will work out of the box."
        ]
      }
    ]
  }
];
export const engineeringNotesPublishedOn = "2026-11-04";
export function getEngineeringNote(slug: string): EngineeringNote | undefined {
  return engineeringNotes.find((note) => note.slug === slug);
}
export function getEngineeringNoteByProjectSlug(projectSlug: string): EngineeringNote | undefined {
  return engineeringNotes.find((note) => note.projectSlug === projectSlug);
}
