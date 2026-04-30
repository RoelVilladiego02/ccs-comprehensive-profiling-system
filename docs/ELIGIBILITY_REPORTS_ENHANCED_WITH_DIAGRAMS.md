# Eligibility Reports - Enhanced Documentation with Diagrams

**Last Updated:** April 29, 2026  
**Status:** ✅ FULLY IMPLEMENTED

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Data Flow Diagrams](#data-flow-diagrams)
3. [Report Type Selection Logic](#report-type-selection-logic)
4. [Query Pipeline](#query-pipeline)
5. [Pre-built Query Templates](#pre-built-query-templates)
6. [Results Processing](#results-processing)
7. [Filter Combinations](#filter-combinations)
8. [Access Control](#access-control)
9. [Use Case Examples](#use-case-examples)

---

## System Architecture

### High-Level System Overview

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend Layer"]
        UI["EligibilityReports Component<br/>React Component"]
        Form["Report Configuration<br/>Dropdowns & Filters"]
        Results["Results Display<br/>Table & Pagination"]
    end

    subgraph API["🔌 API Layer"]
        Skills["Skills Filter<br/>/api/students/filter/skills"]
        Affiliations["Affiliations Filter<br/>/api/students/filter/affiliations"]
        Status["Status Filter<br/>/api/students/filter/status"]
        Categories["Skills by Category<br/>/api/students/filter/skills-by-category"]
        Types["Affiliations by Type<br/>/api/students/filter/affiliations-by-type"]
    end

    subgraph Database["🗄️ Database Layer"]
        Skills_DB["Skills Table<br/>skill_category, skill_name"]
        Affiliations_DB["Affiliations Table<br/>organization_type, organization_name"]
        Students_DB["Students Table<br/>ID, Name, GPA, Status"]
        Violations_DB["Violations Table<br/>student_id, violation_count"]
    end

    UI --> Form
    Form --> API
    API --> Database
    Database --> Results
    
    style Frontend fill:#e1f5ff
    style API fill:#f3e5f5
    style Database fill:#e8f5e9
```

---

## Data Flow Diagrams

### 1. Initial Data Loading Flow

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Frontend as 🖥️ Frontend
    participant API as 🔌 API
    participant DB as 🗄️ Database

    User->>Frontend: Opens Eligibility Reports
    Frontend->>API: GET /students/filter/skills-by-category
    Frontend->>API: GET /students/filter/affiliations-by-type
    Frontend->>API: GET /students (available skills)
    Frontend->>API: GET /affiliations (available affiliations)
    
    API->>DB: Query Skills (grouped by category)
    API->>DB: Query Affiliations (grouped by type)
    API->>DB: Query All Skills
    API->>DB: Query All Affiliations
    
    DB-->>API: Return grouped data
    DB-->>API: Return flat lists
    API-->>Frontend: Skills: {Sports, Technical, ...}
    API-->>Frontend: Affiliations: {Professional, Sports, ...}
    
    Frontend->>Frontend: Populate Dropdowns
    Frontend-->>User: Show Report Type Selection
```

### 2. Report Generation Flow

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Frontend as 🖥️ Frontend
    participant API as 🔌 API
    participant DB as 🗄️ Database
    participant Process as ⚙️ Processing

    User->>Frontend: Configure Filters & Click Generate
    Frontend->>Process: Build Query Object
    Process->>Process: Combine All Filters<br/>Type + Criteria + Thresholds
    Process->>API: Execute Query
    
    alt Skills Only Report
        API->>DB: Filter students by skill
    else Affiliation Report
        API->>DB: Filter students by affiliation
    else Combined Report
        API->>DB: Filter by skill OR affiliation
    else Academic Report
        API->>DB: Filter by GPA + Status
    end
    
    API->>Process: Return matching students
    Process->>Process: Apply GPA Threshold
    Process->>Process: Apply Violation Filter
    Process->>Process: Apply Enrollment Status
    Process->>Process: Sort by GPA (descending)
    Process->>Frontend: Return filtered results
    Frontend->>Frontend: Pagination Setup
    Frontend-->>User: Display Results Table
```

---

## Report Type Selection Logic

### Decision Tree for Report Types

```mermaid
graph TD
    Start["🎯 Select Report Type"]
    
    Start --> Q1{What are you<br/>looking for?}
    
    Q1 -->|Students with<br/>specific skill| SkillReport["📚 Skills Only<br/>Basketball, Programming, etc.<br/><br/>Use case: Team try-outs,<br/>Skill-based recruitment"]
    
    Q1 -->|Students in<br/>organizations| AffReport["🏢 Affiliations Only<br/>Clubs, Organizations<br/><br/>Use case: Org events,<br/>Membership reporting"]
    
    Q1 -->|Students with<br/>BOTH criteria| CombReport["🔗 Combined<br/>Skills + Affiliations<br/><br/>Use case: Complex eligibility,<br/>Program requirements"]
    
    Q1 -->|Students by<br/>academics| AcadReport["📊 Academic Performance<br/>GPA + Enrollment Status<br/><br/>Use case: Dean's list,<br/>Scholarship eligibility"]
    
    SkillReport --> Config1["Configure:<br/>• Skill Category<br/>• Skill Name<br/>• Min GPA<br/>• Max Violations<br/>• Enrollment Status"]
    
    AffReport --> Config2["Configure:<br/>• Affiliation Type<br/>• Organization Name<br/>• Min GPA<br/>• Max Violations<br/>• Enrollment Status"]
    
    CombReport --> Config3["Configure:<br/>• Skill (optional)<br/>• Affiliation (optional)<br/>• Min GPA<br/>• Max Violations<br/>• Enrollment Status"]
    
    AcadReport --> Config4["Configure:<br/>• Min GPA<br/>• Max Violations<br/>• Enrollment Status"]
    
    Config1 --> Generate["⚡ Generate Report"]
    Config2 --> Generate
    Config3 --> Generate
    Config4 --> Generate
    
    style SkillReport fill:#bbdefb
    style AffReport fill:#c8e6c9
    style CombReport fill:#ffe0b2
    style AcadReport fill:#f8bbd0
    style Generate fill:#ffeb3b
```

---

## Query Pipeline

### Filter Application Pipeline

```mermaid
graph LR
    Input["📥 User Input<br/>Report Config"] --> Validate["✓ Validate<br/>All Fields"]
    
    Validate --> Step1["🔍 Step 1: Base Query<br/>Filter by Report Type"]
    
    Step1 --> Check1{Report Type?}
    Check1 -->|Skills Only| S1["SELECT students<br/>WHERE skill = ?"]
    Check1 -->|Affiliations| S2["SELECT students<br/>WHERE affiliation = ?"]
    Check1 -->|Combined| S3["SELECT students<br/>WHERE skill = ? OR<br/>affiliation = ?"]
    Check1 -->|Academic| S4["SELECT students<br/>WHERE 1=1"]
    
    S1 --> Step2["📊 Step 2: Apply Threshold Filters"]
    S2 --> Step2
    S3 --> Step2
    S4 --> Step2
    
    Step2 --> Filter1["Filter: GPA >= minGPA"]
    Filter1 --> Filter2["Filter: violations <= maxViolations"]
    Filter2 --> Filter3["Filter: enrollment_status = ?"]
    
    Filter3 --> Step3["🎯 Step 3: Sort Results"]
    Step3 --> Sort1["Sort by GPA (descending)"]
    
    Sort1 --> Step4["📄 Step 4: Paginate Results"]
    Step4 --> Output["📤 Return to Frontend<br/>Page 1 of N"]
    
    style Input fill:#fff9c4
    style Validate fill:#c8e6c9
    style Step1 fill:#bbdefb
    style Step2 fill:#ffe0b2
    style Step3 fill:#f8bbd0
    style Step4 fill:#d1c4e9
    style Output fill:#b2dfdb
```

---

## Pre-built Query Templates

### Template Overview & Usage

```mermaid
graph TB
    subgraph Templates["🎯 Pre-built Query Templates"]
        T1["🏀 Basketball Try-outs"]
        T2["💻 Programming Contest"]
        T3["👔 Dean's List"]
    end
    
    subgraph Config1["Basketball Try-outs Config"]
        C1A["Report Type: Skills Only"]
        C1B["Skill: Basketball"]
        C1C["Min GPA: 0.00"]
        C1D["Max Violations: 10"]
        C1E["Status: Any"]
    end
    
    subgraph Config2["Programming Contest Config"]
        C2A["Report Type: Skills Only"]
        C2B["Skill: Programming"]
        C2C["Min GPA: 2.5"]
        C2D["Max Violations: 2"]
        C2E["Status: Enrolled/Regular"]
    end
    
    subgraph Config3["Dean's List Config"]
        C3A["Report Type: Academic"]
        C3B["No Skill Required"]
        C3C["Min GPA: 3.5"]
        C3D["Max Violations: 0"]
        C3E["Status: Enrolled"]
    end
    
    T1 -.->|One Click| C1A
    T2 -.->|One Click| C2A
    T3 -.->|One Click| C3A
    
    C1A & C1B & C1C & C1D & C1E -->|All filled| R1["🎯 Results: Active<br/>Basketball Players"]
    C2A & C2B & C2C & C2D & C2E -->|All filled| R2["🎯 Results: Qualified<br/>Programmers"]
    C3A & C3B & C3C & C3D & C3E -->|All filled| R3["🎯 Results: High-Performing<br/>Students"]
    
    style Templates fill:#fff9c4
    style C1A fill:#bbdefb
    style C2A fill:#c8e6c9
    style C3A fill:#f8bbd0
```

---

## Results Processing

### From Query Results to Display

```mermaid
graph TD
    Query["🔍 Query Executed<br/>Students Matched: N"]
    
    Query --> Processing["⚙️ Processing Results"]
    
    Processing --> PS1["Calculate Statistics<br/>• Total Count<br/>• Average GPA<br/>• Max Violations"]
    
    PS1 --> PS2["Enhance Student Data<br/>• Fetch Full Profiles<br/>• Get Academic Details<br/>• Calculate GPA Color"]
    
    PS2 --> Sorting["🔤 Sort by GPA<br/>Highest to Lowest"]
    
    Sorting --> Pagination["📄 Paginate<br/>10 items per page"]
    
    Pagination --> Enhance["✨ Add Visual Indicators"]
    
    Enhance --> Enhance1["GPA Color Coding:<br/>🟢 3.0+ | 🟡 2.0-2.9 | 🔴 &lt;2.0"]
    Enhance1 --> Enhance2["Violation Badges:<br/>✅ None | ⚠️ 1-2 | 🔴 3+"]
    Enhance2 --> Enhance3["Status Pills:<br/>Enrolled | Regular | Irregular"]
    
    Enhance3 --> Display["📊 Display Table with:<br/>• Student ID (Clickable)<br/>• Name<br/>• Email<br/>• GPA (Color-coded)<br/>• Status<br/>• Violations<br/>• View Profile Button"]
    
    Display --> Actions["🎯 User Actions Available:<br/>• Click ID → View Profile<br/>• Pagination Controls<br/>• Export Report (future)<br/>• Generate New Report"]
    
    style Query fill:#fff9c4
    style Processing fill:#e8f5e9
    style Sorting fill:#bbdefb
    style Pagination fill:#ffe0b2
    style Enhance fill:#f8bbd0
    style Display fill:#d1c4e9
    style Actions fill:#b2dfdb
```

---

## Filter Combinations

### Supported Filter Combinations by Report Type

```mermaid
graph TB
    subgraph SkillOnly["Skills Only Report"]
        S1["Filter 1: Skill<br/>(Category → Specific Skill)"]
        S2["Filter 2: Min GPA"]
        S3["Filter 3: Max Violations"]
        S4["Filter 4: Enrollment Status"]
        S1 & S2 & S3 & S4 --> SR["Results: Students with<br/>the specific skill<br/>+applied filters"]
    end
    
    subgraph AffOnly["Affiliations Only Report"]
        A1["Filter 1: Affiliation<br/>(Type → Specific Org)"]
        A2["Filter 2: Min GPA"]
        A3["Filter 3: Max Violations"]
        A4["Filter 4: Enrollment Status"]
        A1 & A2 & A3 & A4 --> AR["Results: Students in<br/>the organization<br/>+applied filters"]
    end
    
    subgraph Combined["Combined Report"]
        C1["Filter 1A: Skill (optional)<br/>(Category → Specific Skill)"]
        C1B["Filter 1B: Affiliation (optional)<br/>(Type → Specific Org)"]
        C2["Filter 2: Min GPA"]
        C3["Filter 3: Max Violations"]
        C4["Filter 4: Enrollment Status"]
        C1 & C1B & C2 & C3 & C4 --> CR["Results: Students with<br/>skill AND/OR affiliation<br/>+applied filters<br/><br/>Note: At least one of<br/>Skill or Affiliation<br/>must be selected"]
    end
    
    subgraph Academic["Academic Performance Report"]
        AC1["Filter 1: Min GPA"]
        AC2["Filter 2: Max Violations"]
        AC3["Filter 3: Enrollment Status"]
        AC1 & AC2 & AC3 --> ACR["Results: Students matching<br/>academic criteria<br/>regardless of skills<br/>or affiliations"]
    end
    
    style SkillOnly fill:#bbdefb
    style AffOnly fill:#c8e6c9
    style Combined fill:#ffe0b2
    style Academic fill:#f8bbd0
```

---

## Access Control

### Role-Based Access & Visibility

```mermaid
graph TB
    subgraph Users["👥 User Roles"]
        Admin["👨‍💼 Admin"]
        Staff["👨‍🏫 Staff"]
        Faculty["👨‍🎓 Faculty"]
        Student["👤 Student"]
    end
    
    Admin -->|Can Access| A1["✅ ALL Reports"]
    Admin -->|Can See| A2["✅ ALL Students Data"]
    Admin -->|Can Perform| A3["✅ Export Reports"]
    
    Staff -->|Can Access| S1["✅ ALL Reports"]
    Staff -->|Can See| S2["✅ ALL Students Data"]
    Staff -->|Can Perform| S3["✅ Export Reports"]
    
    Faculty -->|Cannot Access| F1["❌ Eligibility Reports"]
    Faculty -->|Can See| F2["✅ Only Their Students"]
    Faculty -->|Cannot Perform| F3["❌ Exports"]
    
    Student -->|Cannot Access| ST1["❌ Eligibility Reports"]
    Student -->|Can See| ST2["❌ No Student Data"]
    Student -->|Cannot Perform| ST3["❌ Any Admin Functions"]
    
    A1 & A2 & A3 --> AccessGranted["✅ Full Access"]
    S1 & S2 & S3 --> AccessGranted
    F1 & F2 & F3 --> AccessDenied["❌ Denied"]
    ST1 & ST2 & ST3 --> AccessDenied
    
    AccessGranted --> Navigate["Route: /eligibility-reports"]
    AccessDenied --> Redirect["Redirect to Dashboard"]
    
    style Admin fill:#c8e6c9
    style Staff fill:#c8e6c9
    style Faculty fill:#ffccbc
    style Student fill:#ffccbc
    style AccessGranted fill:#c8e6c9
    style AccessDenied fill:#ffccbc
```

---

## Use Case Examples

### Use Case 1: Basketball Team Try-outs

```mermaid
graph LR
    Coach["👨‍🏫 Coaching Staff"] -->|Need| Need1["Find all eligible<br/>basketball players"]
    
    Need1 --> Step1["1️⃣ Open Eligibility Reports"]
    Step1 --> Step2["2️⃣ Click 'Basketball Try-outs'<br/>button"]
    Step2 --> Step3["3️⃣ Report auto-fills:<br/>• Skill: Basketball<br/>• Min GPA: 0<br/>• Max Violations: 10"]
    Step3 --> Step4["4️⃣ Click 'Generate Report'"]
    
    Step4 --> Process["⚙️ System processes:<br/>• Queries students with basketball skill<br/>• Filters by GPA & violations<br/>• Sorts by GPA descending"]
    
    Process --> Result["📊 Results: Table of<br/>45 basketball players<br/>sorted by academic standing"]
    
    Result --> Use1["✅ Coach reviews list"]
    Use1 --> Use2["✅ Click student ID<br/>to view full profile"]
    Use2 --> Use3["✅ Make team decisions<br/>based on complete info"]
    
    style Coach fill:#fff9c4
    style Need1 fill:#c8e6c9
    style Step1 fill:#bbdefb
    style Process fill:#ffe0b2
    style Result fill:#f8bbd0
```

### Use Case 2: Dean's List Eligibility

```mermaid
graph LR
    Admin["👨‍💼 Administrator"] -->|Need| Need2["Identify students for<br/>academic honors"]
    
    Need2 --> Step1["1️⃣ Open Eligibility Reports"]
    Step1 --> Step2["2️⃣ Click 'Dean's List'<br/>button"]
    Step2 --> Step3["3️⃣ Report auto-fills:<br/>• Min GPA: 3.5<br/>• Max Violations: 0<br/>• Status: Enrolled"]
    Step3 --> Step4["4️⃣ Click 'Generate Report'"]
    
    Step4 --> Process["⚙️ System processes:<br/>• Filters enrolled students<br/>• Min GPA 3.5+<br/>• Zero violations<br/>• Sorts by GPA"]
    
    Process --> Result["📊 Results: 156 eligible<br/>students for honors<br/>with GPA breakdown"]
    
    Result --> Use1["✅ Review honorees"]
    Use1 --> Use2["✅ Prepare honor cords"]
    Use2 --> Use3["✅ Send invitations"]
    
    style Admin fill:#fff9c4
    style Need2 fill:#c8e6c9
    style Step1 fill:#bbdefb
    style Process fill:#ffe0b2
    style Result fill:#f8bbd0
```

### Use Case 3: Programming Internship Program

```mermaid
graph LR
    HR["💼 HR Department"] -->|Need| Need3["Find interns for<br/>programming internships"]
    
    Need3 --> Step1["1️⃣ Open Eligibility Reports"]
    Step1 --> Step2["2️⃣ Select 'Combined'<br/>report type"]
    Step2 --> Step3["3️⃣ Configure:<br/>• Skill: Programming<br/>• Organization: Tech Club<br/>• Min GPA: 2.75<br/>• Max Violations: 1"]
    Step3 --> Step4["4️⃣ Click 'Generate Report'"]
    
    Step4 --> Process["⚙️ System processes:<br/>• Finds students with programming skill<br/>• In tech organizations<br/>• GPA 2.75+<br/>• Max 1 violation<br/>• Sorted by GPA"]
    
    Process --> Result["📊 Results: 23 qualified<br/>interns ready for<br/>placement"]
    
    Result --> Use1["✅ Review profiles"]
    Use1 --> Use2["✅ Schedule interviews"]
    Use2 --> Use3["✅ Place in internships"]
    
    style HR fill:#fff9c4
    style Need3 fill:#c8e6c9
    style Step1 fill:#bbdefb
    style Process fill:#ffe0b2
    style Result fill:#f8bbd0
```

---

## Query Examples with Visual Flow

### Example: Complex Multi-Criteria Query

```mermaid
graph TD
    Query["Query: Find high-performing<br/>Programming Club members<br/>ready for leadership"]
    
    Query --> Config["Configuration:<br/>• Report Type: Combined<br/>• Skill: Programming<br/>• Organization: Programming Club<br/>• Min GPA: 3.0<br/>• Max Violations: 0<br/>• Status: Enrolled"]
    
    Config --> Execute["Execute Query"]
    
    Execute --> Subq1["Sub-Query 1:<br/>Students with Programming skill"]
    Execute --> Subq2["Sub-Query 2:<br/>Students in Programming Club"]
    
    Subq1 & Subq2 --> Combine["Combine Results<br/>(Union: Students in either)"]
    
    Combine --> Filter1["Apply Filter 1: GPA >= 3.0"]
    Filter1 --> Filter2["Apply Filter 2: Violations == 0"]
    Filter2 --> Filter3["Apply Filter 3: Status == Enrolled"]
    
    Filter3 --> Sort["Sort by GPA (Highest First)"]
    Sort --> Paginate["Paginate (10 per page)"]
    
    Paginate --> Results["Final Results:<br/>12 students matching criteria"]
    
    Results --> Display["Display in Table:<br/>Student ID | Name | Email | GPA | Status | Violations"]
    
    style Query fill:#fff9c4
    style Config fill:#e8f5e9
    style Execute fill:#bbdefb
    style Combine fill:#ffe0b2
    style Results fill:#f8bbd0
    style Display fill:#d1c4e9
```

---

## Component Integration Architecture

```mermaid
graph TB
    subgraph Frontend_App["Frontend App Structure"]
        AppJS["App.jsx<br/>Main Router"]
        EligibilityComponent["EligibilityReports.jsx<br/>Main Component"]
        Sidebar["Sidebar.jsx<br/>Navigation"]
        Styling["EligibilityReports.css<br/>Styling"]
    end
    
    subgraph State["State Management"]
        ReportConfig["Report Configuration<br/>Type, Filters, Criteria"]
        Results["Results Data<br/>Student List"]
        UI_State["UI State<br/>Loading, Errors, Modals"]
    end
    
    subgraph Hooks["React Hooks & Effects"]
        UseEffect1["useEffect: Load Filters<br/>Skills, Affiliations"]
        UseEffect2["useEffect: Fetch Details<br/>Student Profiles"]
        UseState["useState: Manage<br/>All Component State"]
    end
    
    subgraph Services["Services Layer"]
        StudentAPI["studentAPI<br/>Student Endpoints"]
        ProfileAPI["studentProfileAPI<br/>Profile Endpoints"]
    end
    
    AppJS -->|Route| EligibilityComponent
    Sidebar -->|Navigate to| EligibilityComponent
    
    EligibilityComponent -->|Uses| State
    EligibilityComponent -->|Uses| Hooks
    EligibilityComponent -->|Uses| Styling
    
    Hooks -->|Calls| Services
    UseEffect1 -->|Load| StudentAPI
    UseEffect2 -->|Fetch| ProfileAPI
    
    Services -->|HTTP| Backend["🔌 Backend API"]
    
    style AppJS fill:#bbdefb
    style EligibilityComponent fill:#c8e6c9
    style Sidebar fill:#ffe0b2
    style Styling fill:#f8bbd0
    style Services fill:#d1c4e9
```

---

## Summary

### Key Metrics & Features

| Feature | Status | Details |
|---------|--------|---------|
| **Report Types** | ✅ 4 types | Skills, Affiliations, Combined, Academic |
| **Cascading Dropdowns** | ✅ Implemented | Category → Specific Item |
| **Filter Combinations** | ✅ All supported | GPA, Violations, Status |
| **Pre-built Templates** | ✅ 3 templates | Basketball, Programming, Dean's List |
| **Sorting** | ✅ By GPA | Highest to lowest |
| **Pagination** | ✅ 10 items/page | Full navigation controls |
| **Color Coding** | ✅ Visual indicators | GPA, Violations, Status |
| **Access Control** | ✅ Role-based | Admin & Staff only |
| **Performance** | ✅ Optimized | Grouped queries, efficient filtering |

### Data Flow Summary

```
User Input → Validation → Query Building → API Call → Database Query 
→ Result Processing → Sorting & Pagination → Visual Enhancement → Display
```

### System Reliability

- ✅ Error handling for API failures
- ✅ Loading states during processing
- ✅ Graceful fallbacks for missing data
- ✅ Modal dialogs for detailed views
- ✅ Console logging for debugging

---

**For more information, see:**
- [ELIGIBILITY_REPORTS_FEATURE.md](ELIGIBILITY_REPORTS_FEATURE.md)
- [ELIGIBILITY_REPORTS_IMPLEMENTATION.md](ELIGIBILITY_REPORTS_IMPLEMENTATION.md)
- [ELIGIBILITY_REPORTS_FIXES.md](ELIGIBILITY_REPORTS_FIXES.md)
