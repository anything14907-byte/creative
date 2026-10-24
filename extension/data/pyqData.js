// PyqRanker Master Dataset for Manifest V3 Extension
const INITIAL_SUBJECTS = [
  {
    id: 'os',
    code: 'CS301',
    name: 'Operating Systems',
    semester: '5th Semester',
    totalCredits: 4,
    units: [
      { unit: 1, title: 'Process Management & CPU Scheduling', description: 'PCB, Process states, Context Switch, FCFS, SJF, Round Robin, Multilevel Queues' },
      { unit: 2, title: 'Process Synchronization & Deadlocks', description: 'Critical Section, Semaphores, Peterson Algorithm, Banker Algorithm, Resource Allocation Graph' },
      { unit: 3, title: 'Memory Management & Virtual Memory', description: 'Paging, Segmentation, TLB, Page Fault handling, FIFO, LRU, Optimal Page Replacement, Thrashing' },
      { unit: 4, title: 'Storage & Disk Scheduling', description: 'Disk Geometry, FCFS, SSTF, SCAN, C-SCAN, LOOK, Inodes, File Allocation Methods' },
      { unit: 5, title: 'Protection, Security & Virtualization', description: 'Access Control Matrix, Hypervisors Type 1 & 2, Buffer Overflow, Cryptographic mechanisms' },
    ]
  },
  {
    id: 'dbms',
    code: 'CS302',
    name: 'Database Management Systems',
    semester: '5th Semester',
    totalCredits: 4,
    units: [
      { unit: 1, title: 'Relational Model & ER Architecture', description: 'Entity-Relationship Diagrams, Relational Algebra, Selection, Projection, Joins, Division' },
      { unit: 2, title: 'SQL & Relational Normalization', description: '1NF, 2NF, 3NF, BCNF, 4NF, Lossless Decomposition, Dependency Preservation, Triggers' },
      { unit: 3, title: 'Transaction Processing & Concurrency', description: 'ACID Properties, Conflict & View Serializability, Two-Phase Locking (2PL), Deadlock handling' },
      { unit: 4, title: 'Indexing, B+ Trees & Query Optimization', description: 'Clustered vs Non-clustered Indexing, B-Trees, B+ Trees, Cost-based Query Execution plans' },
      { unit: 5, title: 'Distributed DBs, NoSQL & Recovery', description: 'WAL Protocol, ARIES Recovery, Two-Phase Commit (2PC), CAP Theorem, Sharding' },
    ]
  },
  {
    id: 'cn',
    code: 'CS303',
    name: 'Computer Networks',
    semester: '5th Semester',
    totalCredits: 4,
    units: [
      { unit: 1, title: 'Network Architecture & Physical Layer', description: 'OSI 7-Layer vs TCP/IP Models, Guided vs Unguided Media, Circuit vs Packet Switching' },
      { unit: 2, title: 'Data Link Layer & MAC Protocols', description: 'Framing, CRC Error Checking, Stop-and-Wait, Go-Back-N, Selective Repeat, CSMA/CD, ALOHA' },
      { unit: 3, title: 'Network Layer & Routing Algorithms', description: 'IPv4 vs IPv6, Subnetting, CIDR, Distance Vector (Bellman-Ford), Link State (Dijkstra), OSPF, BGP' },
      { unit: 4, title: 'Transport Layer Protocols', description: 'TCP 3-Way Handshake, TCP Congestion Control (Slow Start, Congestion Avoidance, AIMD), UDP vs TCP' },
      { unit: 5, title: 'Application Layer & Network Security', description: 'DNS Hierarchy & Resolution, HTTP/1.1 vs HTTP/2, TLS/SSL Handshake, RSA Cryptography' },
    ]
  },
  {
    id: 'dsa',
    code: 'CS304',
    name: 'Data Structures & Algorithms',
    semester: '3rd Semester',
    totalCredits: 4,
    units: [
      { unit: 1, title: 'Asymptotic Analysis & Linear Structures', description: 'Big-O, Omega, Theta, Master Theorem, Linked List cycle detection, Stack & Queue applications' },
      { unit: 2, title: 'Trees & Balanced Search Trees', description: 'Binary Search Tree, AVL Tree Rotations (LL, RR, LR, RL), Red-Black properties, B-Trees' },
      { unit: 3, title: 'Priority Queues, Heaps & Hashing', description: 'Min/Max Binary Heap, HeapSort, Hash collisions, Separate Chaining, Open Addressing' },
      { unit: 4, title: 'Graph Algorithms & Shortest Paths', description: 'BFS, DFS, Topological Sorting, Prim, Kruskal with Disjoint Set Union, Dijkstra, Bellman-Ford' },
      { unit: 5, title: 'Dynamic Programming & Greedy Algorithms', description: '0/1 Knapsack, Fractional Knapsack, Longest Common Subsequence (LCS), Huffman Coding' },
    ]
  }
];

const INITIAL_QUESTIONS = [
  {
    id: 'OS-U2-10M-01',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 2,
    unitTitle: 'Process Synchronization & Deadlocks',
    question: "Explain the Banker's Algorithm for Deadlock Avoidance with a comprehensive example. Define the Safety Algorithm and Resource-Request Algorithm with data structures (Available, Max, Allocation, Need).",
    marks: 10,
    yearsAsked: [2021, 2022, 2023, 2024, 2025],
    repeatCount: 5,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ["Bankers Algorithm", "Safe State", "Available Vector", "Max Matrix", "Allocation Matrix", "Need Matrix", "Deadlock Avoidance"],
    rubricGuide: {
      recommendedWordCount: { min: 200, max: 400 },
      structureRequirements: [
        'Definition of Deadlock Avoidance vs Prevention',
        'Mathematical definition of Need = Max - Allocation',
        'Step-by-step description of the Safety Algorithm',
        'Numerical or Matrix verification example showing safe sequence'
      ],
      keyConcepts: ['Safe Sequence', 'Need Matrix Formula', 'Work and Finish Vectors']
    },
    modelAnswerSummary: "Banker's algorithm tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources, verifying that a safe sequence exists before granting requests.",
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'OS-U1-10M-02',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 1,
    unitTitle: 'Process Management & CPU Scheduling',
    question: "Compare Preemptive and Non-Preemptive CPU Scheduling algorithms. Calculate Average Turnaround Time and Waiting Time for FCFS, SJF, and Round Robin (Time Quantum = 2ms) for given process arrival and burst times.",
    marks: 10,
    yearsAsked: [2021, 2023, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ["Turnaround Time", "Waiting Time", "Gantt Chart", "Time Quantum", "Round Robin", "SJF", "Preemption"],
    rubricGuide: {
      recommendedWordCount: { min: 180, max: 350 },
      structureRequirements: ['Preemptive vs Non-Preemptive table', 'Gantt chart drawing', 'TAT & WT formulas'],
      keyConcepts: ['TAT = Completion - Arrival', 'Waiting Time = TAT - Burst']
    },
    modelAnswerSummary: 'Preemptive scheduling interrupts tasks for higher-priority processes; non-preemptive lets processes run until voluntary release. Round Robin uses time slicing to avoid starvation.',
    userStatus: 'needs-revision',
    userNotes: ''
  },
  {
    id: 'OS-U3-10M-03',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 3,
    unitTitle: 'Memory Management & Virtual Memory',
    question: "What is Paging? Describe the Translation Lookaside Buffer (TLB) architecture and calculate the Effective Memory Access Time (EMAT) given TLB hit ratio, TLB lookup time, and Main Memory access time.",
    marks: 10,
    yearsAsked: [2022, 2023, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ["TLB", "Page Table", "Effective Memory Access Time", "Hit Ratio", "Frame Number", "Page Number", "Paging"],
    rubricGuide: {
      recommendedWordCount: { min: 180, max: 350 },
      structureRequirements: ['Paging translation diagram', 'TLB hardware role', 'EMAT formula derivation'],
      keyConcepts: ['EMAT = h*(c+m) + (1-h)*(c+2m)', 'Internal Fragmentation']
    },
    modelAnswerSummary: 'Paging enables non-contiguous memory allocation. The TLB caches page-to-frame mappings. EMAT = h*(c+m) + (1-h)*(c+2m), reducing average memory latency drastically.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'OS-U2-5M-04',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 2,
    unitTitle: 'Process Synchronization & Deadlocks',
    question: "Define Semaphores. Distinguish between Counting Semaphore and Binary Semaphore. How does the Wait() and Signal() primitive maintain mutual exclusion in the Critical Section problem?",
    marks: 5,
    yearsAsked: [2021, 2022, 2024],
    repeatCount: 3,
    isHighProbability: true,
    frequencyCategory: 'frequent',
    expectedKeywords: ["Semaphore", "Wait Primitive", "Signal Primitive", "Mutual Exclusion", "Critical Section", "Binary Semaphore", "Counting Semaphore"],
    rubricGuide: {
      recommendedWordCount: { min: 90, max: 180 },
      structureRequirements: ['Atomic wait() and signal() definitions', 'Binary vs counting comparison'],
      keyConcepts: ['Atomic Operations', 'Critical section protection']
    },
    modelAnswerSummary: 'A semaphore is an atomic synchronization variable manipulated exclusively via wait() and signal(). Binary acts as a mutex; counting manages pools of identical resources.',
    userStatus: 'mastered',
    userNotes: ''
  },
  {
    id: 'OS-U3-5M-05',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 3,
    unitTitle: 'Memory Management & Virtual Memory',
    question: "Explain Belady's Anomaly in page replacement algorithms with a clear reference string example. Why is LRU immune to Belady's Anomaly?",
    marks: 5,
    yearsAsked: [2021, 2023, 2025],
    repeatCount: 3,
    isHighProbability: true,
    frequencyCategory: 'frequent',
    expectedKeywords: ["Beladys Anomaly", "FIFO", "Page Faults", "Stack Algorithm", "LRU", "Frame Allocation"],
    rubricGuide: {
      recommendedWordCount: { min: 80, max: 160 },
      structureRequirements: ['Definition of Beladys anomaly', 'FIFO counterexample string', 'Stack algorithm explanation'],
      keyConcepts: ['Stack algorithm inclusion property']
    },
    modelAnswerSummary: "Belady's anomaly occurs when allocating more page frames results in more page faults under FIFO. LRU is immune as it satisfies the stack algorithm subset property.",
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'OS-U4-5M-06',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 4,
    unitTitle: 'Storage & Disk Scheduling',
    question: "Compare SCAN and C-SCAN disk scheduling algorithms. Calculate total head movement given a disk request queue and initial head position.",
    marks: 5,
    yearsAsked: [2022, 2024, 2025],
    repeatCount: 3,
    isHighProbability: true,
    frequencyCategory: 'frequent',
    expectedKeywords: ["Disk Scheduling", "SCAN", "C-SCAN", "Head Movement", "Cylinder", "Elevator Algorithm"],
    rubricGuide: {
      recommendedWordCount: { min: 80, max: 160 },
      structureRequirements: ['Elevator behavior of SCAN', 'Circular return of C-SCAN', 'Head movement formula'],
      keyConcepts: ['Uniform waiting time in C-SCAN']
    },
    modelAnswerSummary: 'SCAN sweeps across the disk in one direction then reverses. C-SCAN sweeps in one direction, returning to start without servicing requests to ensure uniform waiting time.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'OS-U1-2M-07',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 1,
    unitTitle: 'Process Management & CPU Scheduling',
    question: "What is a Process Control Block (PCB)? State any four major fields contained within it.",
    marks: 2,
    yearsAsked: [2021, 2022, 2023, 2024, 2025],
    repeatCount: 5,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ["Process Control Block", "PCB", "Program Counter", "Process State", "CPU Registers", "Memory Limits"],
    rubricGuide: {
      recommendedWordCount: { min: 30, max: 60 },
      structureRequirements: ['PCB definition', '4 fields listed'],
      keyConcepts: ['Process representation']
    },
    modelAnswerSummary: 'The PCB is an OS data structure storing all attributes of a process including PID, state, program counter, CPU registers, and memory bounds.',
    userStatus: 'mastered',
    userNotes: ''
  },
  {
    id: 'OS-U2-2M-08',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 2,
    unitTitle: 'Process Synchronization & Deadlocks',
    question: "State the four necessary and sufficient conditions for a Deadlock to occur in an operating system.",
    marks: 2,
    yearsAsked: [2021, 2022, 2023, 2024],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ["Mutual Exclusion", "Hold and Wait", "No Preemption", "Circular Wait", "Deadlock Conditions"],
    rubricGuide: {
      recommendedWordCount: { min: 30, max: 60 },
      structureRequirements: ['List 4 Coffman conditions'],
      keyConcepts: ['Coffman conditions']
    },
    modelAnswerSummary: 'Deadlock requires: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, and 4. Circular Wait holding concurrently.',
    userStatus: 'mastered',
    userNotes: ''
  },

  // DBMS
  {
    id: 'DBMS-U2-10M-01',
    subjectId: 'dbms',
    subjectName: 'Database Management Systems',
    unit: 2,
    unitTitle: 'SQL & Relational Normalization',
    question: "Explain 1NF, 2NF, 3NF, and BCNF with concrete relation schemas and Functional Dependencies (FDs). Show how a relation in 3NF may violate BCNF and demonstrate lossless decomposition.",
    marks: 10,
    yearsAsked: [2021, 2022, 2023, 2024, 2025],
    repeatCount: 5,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ["Normalization", "1NF", "2NF", "3NF", "BCNF", "Functional Dependency", "Superkey", "Lossless Decomposition", "Candidate Key"],
    rubricGuide: {
      recommendedWordCount: { min: 200, max: 400 },
      structureRequirements: ['1NF, 2NF, 3NF definitions', 'BCNF superkey rule', 'Counterexample schema'],
      keyConcepts: ['Prime vs Non-Prime attributes', 'Superkey requirement']
    },
    modelAnswerSummary: 'Normalization decomposes relations to avoid anomalies: 1NF enforces atomicity, 2NF eliminates partial dependencies, 3NF eliminates transitive dependencies, and BCNF requires determinants to be superkeys.',
    userStatus: 'needs-revision',
    userNotes: ''
  },
  {
    id: 'DBMS-U3-10M-02',
    subjectId: 'dbms',
    subjectName: 'Database Management Systems',
    unit: 3,
    unitTitle: 'Transaction Processing & Concurrency',
    question: "Discuss ACID properties in transaction processing. Explain Conflict Serializability and the Precedence (Serialization) Graph method for detecting conflicting schedules.",
    marks: 10,
    yearsAsked: [2021, 2023, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ["ACID Properties", "Atomicity", "Consistency", "Isolation", "Durability", "Conflict Serializability", "Precedence Graph", "Conflict Equivalent"],
    rubricGuide: {
      recommendedWordCount: { min: 180, max: 350 },
      structureRequirements: ['ACID breakdown', 'Conflicting operations definition', 'Graph cycle test'],
      keyConcepts: ['Precedence Graph', 'Conflict equivalence']
    },
    modelAnswerSummary: 'ACID guarantees database integrity. Operations conflict if they touch the same data and one is a write. A schedule is conflict serializable if its precedence graph has no cycles.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'DBMS-U4-10M-03',
    subjectId: 'dbms',
    subjectName: 'Database Management Systems',
    unit: 4,
    unitTitle: 'Indexing, B+ Trees & Query Optimization',
    question: "Describe the structure of a B+ Tree index. Explain insertion and deletion operations with node splitting and merging. Contrast B+ Trees with standard B-Trees for range queries.",
    marks: 10,
    yearsAsked: [2022, 2023, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ["B+ Tree", "B-Tree", "Leaf Nodes", "Linked List", "Range Queries", "Node Splitting", "Internal Nodes", "Clustered Index"],
    rubricGuide: {
      recommendedWordCount: { min: 180, max: 350 },
      structureRequirements: ['B+ Tree diagram', 'Linked leaf advantage', 'Split and merge rules'],
      keyConcepts: ['Linked leaf level', 'High fanout']
    },
    modelAnswerSummary: 'In B+ Trees, all data records/pointers reside in linked leaves, allowing sequential range traversal without tree re-traversals. Internal nodes store only navigation keys.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'DBMS-U3-5M-04',
    subjectId: 'dbms',
    subjectName: 'Database Management Systems',
    unit: 3,
    unitTitle: 'Transaction Processing & Concurrency',
    question: "Explain the Two-Phase Locking (2PL) protocol. Differentiate between Growing Phase and Shrinking Phase. Does Basic 2PL prevent deadlocks?",
    marks: 5,
    yearsAsked: [2021, 2022, 2024],
    repeatCount: 3,
    isHighProbability: true,
    frequencyCategory: 'frequent',
    expectedKeywords: ["Two-Phase Locking", "2PL", "Growing Phase", "Shrinking Phase", "Lock Point", "Deadlock", "Cascading Rollback"],
    rubricGuide: {
      recommendedWordCount: { min: 80, max: 170 },
      structureRequirements: ['Growing vs shrinking phase', 'Lock point definition', 'Deadlock disclaimer'],
      keyConcepts: ['Conflict serializability guarantee', 'Deadlocks possible']
    },
    modelAnswerSummary: '2PL requires acquiring all locks before releasing any. It guarantees conflict serializability, but does not prevent deadlocks or cascading aborts.',
    userStatus: 'mastered',
    userNotes: ''
  },

  // COMPUTER NETWORKS
  {
    id: 'CN-U4-10M-01',
    subjectId: 'cn',
    subjectName: 'Computer Networks',
    unit: 4,
    unitTitle: 'Transport Layer Protocols',
    question: "Explain TCP Congestion Control mechanisms in detail, including Slow Start, Congestion Avoidance, Fast Retransmit, and Fast Recovery. Illustrate with a Congestion Window (cwnd) vs Transmission Round graph.",
    marks: 10,
    yearsAsked: [2021, 2022, 2023, 2024, 2025],
    repeatCount: 5,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ["TCP Congestion Control", "Slow Start", "Congestion Avoidance", "Fast Retransmit", "Fast Recovery", "AIMD", "ssthresh", "cwnd"],
    rubricGuide: {
      recommendedWordCount: { min: 200, max: 400 },
      structureRequirements: ['cwnd and ssthresh definitions', 'Exponential vs linear growth', '3 Dup ACK trigger', 'Graph description'],
      keyConcepts: ['Additive Increase Multiplicative Decrease']
    },
    modelAnswerSummary: 'TCP regulates traffic via cwnd. Slow Start doubles cwnd every RTT until ssthresh, after which Congestion Avoidance adds 1 MSS per RTT. 3 duplicate ACKs trigger Fast Retransmit and Fast Recovery.',
    userStatus: 'needs-revision',
    userNotes: ''
  },
  {
    id: 'CN-U3-10M-02',
    subjectId: 'cn',
    subjectName: 'Computer Networks',
    unit: 3,
    unitTitle: 'Network Layer & Routing Algorithms',
    question: "Compare Distance Vector Routing and Link State Routing. Explain the Count-to-Infinity problem in Distance Vector routing and discuss how Split Horizon and Poison Reverse mitigate it.",
    marks: 10,
    yearsAsked: [2021, 2023, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ["Distance Vector", "Link State", "Bellman-Ford", "Dijkstra", "Count to Infinity", "Split Horizon", "Poison Reverse", "Routing Loop"],
    rubricGuide: {
      recommendedWordCount: { min: 180, max: 350 },
      structureRequirements: ['Comparison table', 'Routing loop scenario', 'Split horizon definition'],
      keyConcepts: ['Slow convergence of bad news']
    },
    modelAnswerSummary: 'Distance Vector shares full tables with direct neighbors (Bellman-Ford); Link State broadcasts link states to all nodes (Dijkstra). Count-to-infinity is mitigated by Split Horizon and Poison Reverse.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'CN-U4-5M-04',
    subjectId: 'cn',
    subjectName: 'Computer Networks',
    unit: 4,
    unitTitle: 'Transport Layer Protocols',
    question: "Explain the TCP Three-Way Handshake connection establishment and Four-Way Handshake connection termination with sequence/acknowledgment numbers and state transitions.",
    marks: 5,
    yearsAsked: [2021, 2022, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ["Three-Way Handshake", "SYN", "SYN-ACK", "ACK", "FIN", "TIME_WAIT", "Connection Establishment"],
    rubricGuide: {
      recommendedWordCount: { min: 90, max: 180 },
      structureRequirements: ['SYN, SYN-ACK, ACK sequence', 'Four-way FIN termination', 'TIME_WAIT rationale'],
      keyConcepts: ['ISN synchronization']
    },
    modelAnswerSummary: 'TCP establishes reliable connections via SYN -> SYN-ACK -> ACK. Termination requires four packets (FIN, ACK, FIN, ACK) with a TIME_WAIT state to ensure pending packets drain.',
    userStatus: 'mastered',
    userNotes: ''
  },

  // DATA STRUCTURES
  {
    id: 'DSA-U2-10M-01',
    subjectId: 'dsa',
    subjectName: 'Data Structures & Algorithms',
    unit: 2,
    unitTitle: 'Trees & Balanced Search Trees',
    question: "Define an AVL Tree. Explain the Balance Factor and all four rotation cases (LL, RR, LR, RL) used to restore balance during insertion. Demonstrate with the sequence: 10, 20, 30, 40, 50, 25.",
    marks: 10,
    yearsAsked: [2021, 2022, 2023, 2024, 2025],
    repeatCount: 5,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ["AVL Tree", "Balance Factor", "LL Rotation", "RR Rotation", "LR Rotation", "RL Rotation", "Height Balanced", "O(log N)"],
    rubricGuide: {
      recommendedWordCount: { min: 200, max: 400 },
      structureRequirements: ['Balance factor {-1,0,1}', 'Single vs double rotation', 'Sequence trace', 'O(log n) complexity'],
      keyConcepts: ['Self-balancing binary search tree']
    },
    modelAnswerSummary: 'An AVL tree maintains height balance such that balance factors stay between -1 and 1. Violations are fixed through LL, RR (single), or LR, RL (double) rotations, guaranteeing O(log n) operations.',
    userStatus: 'needs-revision',
    userNotes: ''
  },
  {
    id: 'DSA-U4-10M-02',
    subjectId: 'dsa',
    subjectName: 'Data Structures & Algorithms',
    unit: 4,
    unitTitle: 'Graph Algorithms & Shortest Paths',
    question: "Explain Dijkstra's Single Source Shortest Path algorithm with pseudocode. Analyze its time complexity using Adjacency Matrix vs Min-Heap with Adjacency List. Why does it fail for negative edge weights?",
    marks: 10,
    yearsAsked: [2021, 2022, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ["Dijkstras Algorithm", "Single Source Shortest Path", "Min-Heap", "Greedy Choice", "Negative Weights", "Relaxation", "Time Complexity"],
    rubricGuide: {
      recommendedWordCount: { min: 180, max: 350 },
      structureRequirements: ['Relaxation condition', 'Heap complexity O((V+E)log V)', 'Negative weight counterexample'],
      keyConcepts: ['Greedy irreversible path finalization']
    },
    modelAnswerSummary: "Dijkstra computes single-source shortest paths in non-negative weighted graphs in O((V+E)log V) using a min-heap. It fails on negative weights because greedy choices cannot be revised once marked settled.",
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'DSA-U5-10M-03',
    subjectId: 'dsa',
    subjectName: 'Data Structures & Algorithms',
    unit: 5,
    unitTitle: 'Dynamic Programming & Greedy Algorithms',
    question: "Solve the 0/1 Knapsack Problem using Dynamic Programming. Provide the recurrence relation, algorithm, and trace the DP table for items with weights {2, 3, 4, 5}, values {3, 4, 5, 6}, and capacity W = 5.",
    marks: 10,
    yearsAsked: [2021, 2023, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ["0/1 Knapsack", "Dynamic Programming", "Recurrence Relation", "Optimal Substructure", "Overlapping Subproblems", "DP Table", "Pseudo-polynomial"],
    rubricGuide: {
      recommendedWordCount: { min: 180, max: 350 },
      structureRequirements: ['Recurrence formula', 'DP grid trace', 'Time & Space complexity O(NW)'],
      keyConcepts: ['Include vs exclude item trade-off']
    },
    modelAnswerSummary: '0/1 Knapsack uses DP table K[i][w] = max(K[i-1][w], val[i] + K[i-1][w-wt[i]]) to pick the optimal subset of non-fractional items within weight capacity W in O(NW) time.',
    userStatus: 'not-started',
    userNotes: ''
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INITIAL_SUBJECTS, INITIAL_QUESTIONS };
}
