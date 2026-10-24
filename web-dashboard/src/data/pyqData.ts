import { SubjectMeta, PYQQuestion } from '../types';

export const INITIAL_SUBJECTS: SubjectMeta[] = [
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

export const INITIAL_QUESTIONS: PYQQuestion[] = [
  // ==========================================
  // OPERATING SYSTEMS (CS301)
  // ==========================================
  {
    id: 'OS-U2-10M-01',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 2,
    unitTitle: 'Process Synchronization & Deadlocks',
    question: 'Explain the Banker\'s Algorithm for Deadlock Avoidance with a comprehensive example. Define the Safety Algorithm and Resource-Request Algorithm with data structures (Available, Max, Allocation, Need).',
    marks: 10,
    yearsAsked: [2021, 2022, 2023, 2024, 2025],
    repeatCount: 5,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['Bankers Algorithm', 'Safe State', 'Available Vector', 'Max Matrix', 'Allocation Matrix', 'Need Matrix', 'Deadlock Avoidance'],
    rubricGuide: {
      recommendedWordCount: { min: 200, max: 400 },
      structureRequirements: [
        'Definition of Deadlock Avoidance vs Prevention',
        'Mathematical definition of Need = Max - Allocation',
        'Step-by-step description of the Safety Algorithm',
        'Numerical or Matrix verification example showing safe sequence'
      ],
      keyConcepts: ['Safe Sequence', 'Need Matrix Formula', 'Work and Finish Vectors', 'Resource Grant Condition']
    },
    modelAnswerSummary: 'Banker\'s algorithm tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources, and then makes an "s-state" check to test for possible activities before deciding whether allocation should be allowed.',
    userStatus: 'not-started',
    userNotes: '',
    bookmarked: true
  },
  {
    id: 'OS-U1-10M-02',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 1,
    unitTitle: 'Process Management & CPU Scheduling',
    question: 'Compare Preemptive and Non-Preemptive CPU Scheduling algorithms. Calculate Average Turnaround Time and Waiting Time for FCFS, SJF, and Round Robin (Time Quantum = 2ms) for given process arrival and burst times.',
    marks: 10,
    yearsAsked: [2021, 2023, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['Turnaround Time', 'Waiting Time', 'Gantt Chart', 'Time Quantum', 'Round Robin', 'SJF', 'Preemption'],
    rubricGuide: {
      recommendedWordCount: { min: 180, max: 350 },
      structureRequirements: [
        'Clear distinction table between Preemptive vs Non-Preemptive',
        'Gantt chart drawing/representation for each algorithm',
        'Formulas: Turnaround Time = Completion - Arrival, Waiting Time = Turnaround - Burst',
        'Summary table comparing Average Waiting Times'
      ],
      keyConcepts: ['TAT and WT formulas', 'Convoy Effect in FCFS', 'Starvation in SJF', 'Time Slice Tradeoff']
    },
    modelAnswerSummary: 'Preemptive allows interrupting running processes when higher priority arrives; Non-preemptive runs until process yields or terminates. FCFS suffers convoy effect; Round Robin guarantees fairness via time slicing.',
    userStatus: 'needs-revision',
    userNotes: 'Remember formula: Waiting Time = TAT - Burst Time.'
  },
  {
    id: 'OS-U3-10M-03',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 3,
    unitTitle: 'Memory Management & Virtual Memory',
    question: 'What is Paging? Describe the Translation Lookaside Buffer (TLB) architecture and calculate the Effective Memory Access Time (EMAT) given TLB hit ratio, TLB lookup time, and Main Memory access time.',
    marks: 10,
    yearsAsked: [2022, 2023, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['TLB', 'Page Table', 'Effective Memory Access Time', 'Hit Ratio', 'Frame Number', 'Page Number', 'Paging'],
    rubricGuide: {
      recommendedWordCount: { min: 180, max: 350 },
      structureRequirements: [
        'Diagram/explanation of Logical address (p, d) translation to Physical address (f, d)',
        'Role and hardware purpose of TLB (associative cache)',
        'EMAT Formula derivation: EMAT = h * (t_tlb + m) + (1 - h) * (t_tlb + 2m)',
        'Numerical calculation example'
      ],
      keyConcepts: ['Associative Memory', 'TLB Miss Penalty', 'Internal Fragmentation', 'Page Table Base Register']
    },
    modelAnswerSummary: 'Paging non-contiguously maps logical pages to physical frames. TLB caches recent translations. EMAT = h*(c + m) + (1-h)*(c + 2m), reducing average memory latency from two accesses to nearly one.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'OS-U2-5M-04',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 2,
    unitTitle: 'Process Synchronization & Deadlocks',
    question: 'Define Semaphores. Distinguish between Counting Semaphore and Binary Semaphore. How does the Wait() and Signal() primitive maintain mutual exclusion in the Critical Section problem?',
    marks: 5,
    yearsAsked: [2021, 2022, 2024],
    repeatCount: 3,
    isHighProbability: true,
    frequencyCategory: 'frequent',
    expectedKeywords: ['Semaphore', 'Wait Primitive', 'Signal Primitive', 'Mutual Exclusion', 'Critical Section', 'Binary Semaphore', 'Counting Semaphore'],
    rubricGuide: {
      recommendedWordCount: { min: 90, max: 180 },
      structureRequirements: [
        'Definition of Semaphore integer variable and atomicity',
        'Pseudocode for wait() (P) and signal() (V)',
        'Comparison table between Binary vs Counting Semaphore',
        'Criteria met: Mutual exclusion, Progress, Bounded Waiting'
      ],
      keyConcepts: ['Atomic Operations', 'Busy Waiting / Spinlock', 'Resource Counting']
    },
    modelAnswerSummary: 'A semaphore is a synchronization tool consisting of an integer value accessed only through atomic wait() and signal() operations. Binary semaphores act as mutex locks; counting semaphores control finite resource pools.',
    userStatus: 'mastered',
    userNotes: 'Wait decrements, signal increments. Must be atomic!'
  },
  {
    id: 'OS-U3-5M-05',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 3,
    unitTitle: 'Memory Management & Virtual Memory',
    question: 'Explain Belady\'s Anomaly in page replacement algorithms with a clear reference string example. Why is LRU immune to Belady\'s Anomaly?',
    marks: 5,
    yearsAsked: [2021, 2023, 2025],
    repeatCount: 3,
    isHighProbability: true,
    frequencyCategory: 'frequent',
    expectedKeywords: ['Beladys Anomaly', 'FIFO', 'Page Faults', 'Stack Algorithm', 'LRU', 'Frame Allocation'],
    rubricGuide: {
      recommendedWordCount: { min: 80, max: 160 },
      structureRequirements: [
        'Formal definition: More frames causing MORE page faults',
        'Classic 12-reference string counterexample (e.g. 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5)',
        'Explanation of why LRU is a stack algorithm and therefore immune'
      ],
      keyConcepts: ['FIFO vulnerability', 'Stack algorithm property', 'Subset inclusion property']
    },
    modelAnswerSummary: 'Belady\'s anomaly is the phenomenon where increasing page frames leads to more page faults under FIFO. LRU is immune because it belongs to the class of stack algorithms where n-frame page set is always a subset of (n+1)-frame page set.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'OS-U4-5M-06',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 4,
    unitTitle: 'Storage & Disk Scheduling',
    question: 'Compare SCAN and C-SCAN disk scheduling algorithms. Calculate total head movement given a disk request queue and initial head position.',
    marks: 5,
    yearsAsked: [2022, 2024, 2025],
    repeatCount: 3,
    isHighProbability: true,
    frequencyCategory: 'frequent',
    expectedKeywords: ['Disk Scheduling', 'SCAN', 'C-SCAN', 'Head Movement', 'Cylinder', 'Elevator Algorithm'],
    rubricGuide: {
      recommendedWordCount: { min: 80, max: 160 },
      structureRequirements: [
        'Elevator behavior explanation of SCAN',
        'Circular unidirectional scan of C-SCAN to ensure uniform waiting time',
        'Numerical head movement calculation'
      ],
      keyConcepts: ['Starvation prevention', 'Uniform wait time', 'Boundary servicing']
    },
    modelAnswerSummary: 'SCAN services requests in one direction until the disk end then reverses. C-SCAN services requests in one direction, then immediately returns to the start without servicing, providing more uniform wait time.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'OS-U1-2M-07',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 1,
    unitTitle: 'Process Management & CPU Scheduling',
    question: 'What is a Process Control Block (PCB)? State any four major fields contained within it.',
    marks: 2,
    yearsAsked: [2021, 2022, 2023, 2024, 2025],
    repeatCount: 5,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['Process Control Block', 'PCB', 'Program Counter', 'Process State', 'CPU Registers', 'Memory Limits'],
    rubricGuide: {
      recommendedWordCount: { min: 30, max: 60 },
      structureRequirements: [
        'Clear 1-sentence definition of PCB',
        'Bullet list of 4 key fields: Process ID/State, Program Counter, CPU Registers, Memory Management Info'
      ],
      keyConcepts: ['Process representation', 'Context switching data structure']
    },
    modelAnswerSummary: 'The PCB is an OS data structure storing all attributes of a process. Key fields: Process ID & State, Program Counter, CPU Registers, and Memory Allocation Info.',
    userStatus: 'mastered',
    userNotes: ''
  },
  {
    id: 'OS-U2-2M-08',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    unit: 2,
    unitTitle: 'Process Synchronization & Deadlocks',
    question: 'State the four necessary and sufficient conditions for a Deadlock to occur in an operating system.',
    marks: 2,
    yearsAsked: [2021, 2022, 2023, 2024],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait', 'Deadlock Conditions'],
    rubricGuide: {
      recommendedWordCount: { min: 30, max: 60 },
      structureRequirements: [
        'List exactly the 4 Coffman conditions with brief 1-line notes'
      ],
      keyConcepts: ['Coffman Conditions', 'Simultaneous occurrence required']
    },
    modelAnswerSummary: 'Deadlock requires: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait occurring simultaneously.',
    userStatus: 'mastered',
    userNotes: ''
  },

  // ==========================================
  // DATABASE MANAGEMENT SYSTEMS (CS302)
  // ==========================================
  {
    id: 'DBMS-U2-10M-01',
    subjectId: 'dbms',
    subjectName: 'Database Management Systems',
    unit: 2,
    unitTitle: 'SQL & Relational Normalization',
    question: 'Explain 1NF, 2NF, 3NF, and BCNF with concrete relation schemas and Functional Dependencies (FDs). Show how a relation in 3NF may violate BCNF and demonstrate lossless decomposition.',
    marks: 10,
    yearsAsked: [2021, 2022, 2023, 2024, 2025],
    repeatCount: 5,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['Normalization', '1NF', '2NF', '3NF', 'BCNF', 'Functional Dependency', 'Superkey', 'Lossless Decomposition', 'Candidate Key'],
    rubricGuide: {
      recommendedWordCount: { min: 200, max: 400 },
      structureRequirements: [
        'Definition of 1NF (atomic values), 2NF (no partial dependency), 3NF (no transitive dependency)',
        'BCNF strict rule: For every X -> Y, X must be a superkey',
        'Example relation violating BCNF but satisfying 3NF',
        'Decomposition check for Lossless Join and Dependency Preservation'
      ],
      keyConcepts: ['Prime vs Non-Prime attributes', 'Transitive Dependency', 'Superkey condition', 'Decomposition trade-offs']
    },
    modelAnswerSummary: 'Normalization reduces anomalies. 1NF enforces atomic domains; 2NF removes partial key dependencies; 3NF eliminates transitive dependencies; BCNF requires that in every non-trivial FD X->Y, X is a superkey.',
    userStatus: 'needs-revision',
    userNotes: 'BCNF does not guarantee dependency preservation, while 3NF always does.'
  },
  {
    id: 'DBMS-U3-10M-02',
    subjectId: 'dbms',
    subjectName: 'Database Management Systems',
    unit: 3,
    unitTitle: 'Transaction Processing & Concurrency',
    question: 'Discuss ACID properties in transaction processing. Explain Conflict Serializability and the Precedence (Serialization) Graph method for detecting conflicting schedules.',
    marks: 10,
    yearsAsked: [2021, 2023, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['ACID Properties', 'Atomicity', 'Consistency', 'Isolation', 'Durability', 'Conflict Serializability', 'Precedence Graph', 'Conflict Equivalent'],
    rubricGuide: {
      recommendedWordCount: { min: 180, max: 350 },
      structureRequirements: [
        'Detailed explanation of each ACID component and mechanism (e.g. WAL, concurrency control)',
        'Definition of conflicting read/write operations',
        'Step-by-step algorithm to construct Precedence Graph',
        'Rule: Schedule is conflict serializable iff Precedence Graph has no cycles'
      ],
      keyConcepts: ['Read-Write Conflicts', 'Write-Write Conflicts', 'Cycle detection', 'Topological sort order']
    },
    modelAnswerSummary: 'ACID guarantees reliable transactions. Two operations conflict if they belong to different transactions, access the same item, and at least one is a write. A schedule is conflict serializable if its precedence graph contains no directed cycles.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'DBMS-U4-10M-03',
    subjectId: 'dbms',
    subjectName: 'Database Management Systems',
    unit: 4,
    unitTitle: 'Indexing, B+ Trees & Query Optimization',
    question: 'Describe the structure of a B+ Tree index. Explain insertion and deletion operations with node splitting and merging. Contrast B+ Trees with standard B-Trees for range queries.',
    marks: 10,
    yearsAsked: [2022, 2023, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['B+ Tree', 'B-Tree', 'Leaf Nodes', 'Linked List', 'Range Queries', 'Node Splitting', 'Internal Nodes', 'Clustered Index'],
    rubricGuide: {
      recommendedWordCount: { min: 180, max: 350 },
      structureRequirements: [
        'Structural diagram: data records/pointers exclusively in leaf nodes in B+ Tree',
        'Linked leaves enabling O(log N + k) fast sequential range scans',
        'Split criteria (overflow > m-1 keys)',
        'Comparison table between B-Tree and B+ Tree'
      ],
      keyConcepts: ['Doubly linked leaf level', 'High fanout', 'Balanced height O(log_m N)', 'Disk I/O reduction']
    },
    modelAnswerSummary: 'B+ Trees store all actual record keys in linked leaf nodes, while internal nodes only hold router keys. This maximizes branching factor, minimizes tree depth, and makes range scans fast via sequential leaf traversal.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'DBMS-U3-5M-04',
    subjectId: 'dbms',
    subjectName: 'Database Management Systems',
    unit: 3,
    unitTitle: 'Transaction Processing & Concurrency',
    question: 'Explain the Two-Phase Locking (2PL) protocol. Differentiate between Growing Phase and Shrinking Phase. Does Basic 2PL prevent deadlocks?',
    marks: 5,
    yearsAsked: [2021, 2022, 2024],
    repeatCount: 3,
    isHighProbability: true,
    frequencyCategory: 'frequent',
    expectedKeywords: ['Two-Phase Locking', '2PL', 'Growing Phase', 'Shrinking Phase', 'Lock Point', 'Deadlock', 'Cascading Rollback'],
    rubricGuide: {
      recommendedWordCount: { min: 80, max: 170 },
      structureRequirements: [
        'Rule: Once a lock is released, no new lock may be acquired',
        'Definition of Growing Phase vs Shrinking Phase and Lock Point',
        'Crucial clarification: 2PL guarantees Conflict Serializability but does NOT prevent deadlocks',
        'Mention of Strict / Rigorous 2PL for avoiding cascading rollbacks'
      ],
      keyConcepts: ['Serializability guarantee', 'Deadlock susceptibility', 'Cascadelessness']
    },
    modelAnswerSummary: '2PL enforces that transactions acquire all locks in a growing phase and release them in a shrinking phase. It guarantees conflict serializability, but can still lead to deadlocks and cascading aborts (solved by Strict 2PL).',
    userStatus: 'mastered',
    userNotes: ''
  },
  {
    id: 'DBMS-U1-5M-05',
    subjectId: 'dbms',
    subjectName: 'Database Management Systems',
    unit: 1,
    unitTitle: 'Relational Model & ER Architecture',
    question: 'Explain fundamental operations in Relational Algebra: Selection (σ), Projection (π), Cartesian Product (×), and Natural Join (⋈) with concise syntax and examples.',
    marks: 5,
    yearsAsked: [2021, 2023, 2024],
    repeatCount: 3,
    isHighProbability: true,
    frequencyCategory: 'frequent',
    expectedKeywords: ['Relational Algebra', 'Selection', 'Projection', 'Cartesian Product', 'Natural Join', 'Tuple', 'Predicate'],
    rubricGuide: {
      recommendedWordCount: { min: 80, max: 160 },
      structureRequirements: [
        'Mathematical symbols and definitions for σ, π, ×, ⋈',
        'Small relational table illustration'
      ],
      keyConcepts: ['Horizontal filtering (Selection)', 'Vertical filtering (Projection)', 'Join condition']
    },
    modelAnswerSummary: 'Selection filters tuples meeting a predicate (horizontal); Projection picks specified columns (vertical); Cartesian product pairs every tuple; Natural join combines rows with matching common attribute values.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'DBMS-U3-2M-06',
    subjectId: 'dbms',
    subjectName: 'Database Management Systems',
    unit: 3,
    unitTitle: 'Transaction Processing & Concurrency',
    question: 'What is a Dirty Read problem in database transactions? Which isolation level prevents it?',
    marks: 2,
    yearsAsked: [2022, 2023, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['Dirty Read', 'Uncommitted Data', 'Rollback', 'Read Committed', 'Transaction Isolation'],
    rubricGuide: {
      recommendedWordCount: { min: 30, max: 60 },
      structureRequirements: [
        'Clear definition: Reading uncommitted modifications made by another concurrent transaction that later rolls back',
        'Isolation level answer: READ COMMITTED (or higher)'
      ],
      keyConcepts: ['Concurrency anomaly', 'Read Committed isolation']
    },
    modelAnswerSummary: 'A Dirty Read occurs when a transaction reads data modified by an uncommitted concurrent transaction that subsequently rolls back. It is prevented by the READ COMMITTED isolation level.',
    userStatus: 'mastered',
    userNotes: ''
  },

  // ==========================================
  // COMPUTER NETWORKS (CS303)
  // ==========================================
  {
    id: 'CN-U4-10M-01',
    subjectId: 'cn',
    subjectName: 'Computer Networks',
    unit: 4,
    unitTitle: 'Transport Layer Protocols',
    question: 'Explain TCP Congestion Control mechanisms in detail, including Slow Start, Congestion Avoidance, Fast Retransmit, and Fast Recovery. Illustrate with a Congestion Window (cwnd) vs Transmission Round graph.',
    marks: 10,
    yearsAsked: [2021, 2022, 2023, 2024, 2025],
    repeatCount: 5,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['TCP Congestion Control', 'Slow Start', 'Congestion Avoidance', 'Fast Retransmit', 'Fast Recovery', 'AIMD', 'ssthresh', 'cwnd'],
    rubricGuide: {
      recommendedWordCount: { min: 200, max: 400 },
      structureRequirements: [
        'Definition of cwnd and ssthresh (slow start threshold)',
        'Exponential growth in Slow Start vs Linear increase in Congestion Avoidance (AIMD)',
        'Trigger for 3 Duplicate ACKs vs Timeout loss',
        'Graph sketch showing cwnd curve and reactions to packet loss'
      ],
      keyConcepts: ['Additive Increase Multiplicative Decrease', 'Triple Duplicate ACKs', 'Exponential vs Additive phase', 'Reno vs Tahoe']
    },
    modelAnswerSummary: 'TCP controls congestion using cwnd. In Slow Start, cwnd doubles every RTT until ssthresh. In Congestion Avoidance, cwnd increases linearly by 1 MSS/RTT. On 3 duplicate ACKs, Fast Retransmit re-sends the lost packet and enters Fast Recovery without dropping cwnd back to 1.',
    userStatus: 'needs-revision',
    userNotes: 'On timeout: cwnd resets to 1 MSS and ssthresh = cwnd / 2.'
  },
  {
    id: 'CN-U3-10M-02',
    subjectId: 'cn',
    subjectName: 'Computer Networks',
    unit: 3,
    unitTitle: 'Network Layer & Routing Algorithms',
    question: 'Compare Distance Vector Routing and Link State Routing. Explain the Count-to-Infinity problem in Distance Vector routing and discuss how Split Horizon and Poison Reverse mitigate it.',
    marks: 10,
    yearsAsked: [2021, 2023, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['Distance Vector', 'Link State', 'Bellman-Ford', 'Dijkstra', 'Count to Infinity', 'Split Horizon', 'Poison Reverse', 'Routing Loop'],
    rubricGuide: {
      recommendedWordCount: { min: 180, max: 350 },
      structureRequirements: [
        'Comparison table: Global vs Decentralized knowledge, Bellman-Ford vs Dijkstra',
        'Step-by-step routing loop breakdown showing how cost creeps up to infinity (16 in RIP)',
        'Explanation of Split Horizon (never advertise route back out the interface it was learned from)',
        'Explanation of Poison Reverse (advertising route with metric infinity)'
      ],
      keyConcepts: ['Convergence speed', 'Periodic vs Triggered updates', 'Metric infinity = 16']
    },
    modelAnswerSummary: 'Distance Vector shares routing table copies with immediate neighbors (Bellman-Ford); Link State floods link costs to all nodes (Dijkstra). Count-to-infinity occurs from slow convergence of bad news, mitigated by Split Horizon and Poison Reverse.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'CN-U2-10M-03',
    subjectId: 'cn',
    subjectName: 'Computer Networks',
    unit: 2,
    unitTitle: 'Data Link Layer & MAC Protocols',
    question: 'Explain Sliding Window Flow Control protocols. Contrast Go-Back-N (GBN) and Selective Repeat (SR) with respect to sender window size, receiver window size, acknowledgments, and retransmission overhead.',
    marks: 10,
    yearsAsked: [2022, 2023, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['Sliding Window', 'Go-Back-N', 'Selective Repeat', 'Window Size', 'Cumulative ACK', 'Individual ACK', 'Sequence Numbers'],
    rubricGuide: {
      recommendedWordCount: { min: 180, max: 350 },
      structureRequirements: [
        'Diagram of sliding window at sender and receiver',
        'Sender/Receiver window formula: GBN (Ws = 2^k - 1, Wr = 1); SR (Ws = Wr = 2^(k-1))',
        'Handling of packet loss: GBN discards out-of-order packets; SR buffers out-of-order packets',
        'Detailed comparison table'
      ],
      keyConcepts: ['Cumulative vs Independent ACK', 'Buffer requirements at receiver', 'Bandwidth utilization']
    },
    modelAnswerSummary: 'Sliding window protocols allow sending multiple frames before ACK. GBN uses cumulative ACKs and receiver window 1, retransmitting all unacknowledged frames on loss. SR uses independent ACKs and buffers out-of-order frames, retransmitting only lost frames.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'CN-U4-5M-04',
    subjectId: 'cn',
    subjectName: 'Computer Networks',
    unit: 4,
    unitTitle: 'Transport Layer Protocols',
    question: 'Explain the TCP Three-Way Handshake connection establishment and Four-Way Handshake connection termination with sequence/acknowledgment numbers and state transitions.',
    marks: 5,
    yearsAsked: [2021, 2022, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['Three-Way Handshake', 'SYN', 'SYN-ACK', 'ACK', 'FIN', 'TIME_WAIT', 'Connection Establishment'],
    rubricGuide: {
      recommendedWordCount: { min: 90, max: 180 },
      structureRequirements: [
        'Step 1: Client SYN, Step 2: Server SYN-ACK, Step 3: Client ACK',
        'Termination steps: FIN, ACK, FIN, ACK and purpose of TIME_WAIT state'
      ],
      keyConcepts: ['Initial Sequence Number (ISN) synchronization', 'Full duplex termination']
    },
    modelAnswerSummary: 'TCP establishes reliable connections via 3-way handshake: Client sends SYN(seq=x); Server responds with SYN-ACK(seq=y, ack=x+1); Client confirms with ACK(ack=y+1). Termination uses 4 packets with FIN and ACK from both sides.',
    userStatus: 'mastered',
    userNotes: ''
  },
  {
    id: 'CN-U3-5M-05',
    subjectId: 'cn',
    subjectName: 'Computer Networks',
    unit: 3,
    unitTitle: 'Network Layer & Routing Algorithms',
    question: 'What is Subnetting and Classless Inter-Domain Routing (CIDR)? Given an IP block 192.168.10.0/24, create 4 equal-sized subnets and list their subnet masks, usable host ranges, and broadcast addresses.',
    marks: 5,
    yearsAsked: [2022, 2024],
    repeatCount: 2,
    isHighProbability: false,
    frequencyCategory: 'frequent',
    expectedKeywords: ['Subnetting', 'CIDR', 'Subnet Mask', 'Host Range', 'Broadcast Address', 'Network Prefix'],
    rubricGuide: {
      recommendedWordCount: { min: 80, max: 160 },
      structureRequirements: [
        'Definition of borrowing 2 host bits (/26)',
        'New subnet mask: 255.255.255.192',
        'Clean table of 4 subnets with Network, First Usable, Last Usable, and Broadcast IPs'
      ],
      keyConcepts: ['Host count 2^(32-prefix) - 2', 'Prefix slash notation']
    },
    modelAnswerSummary: 'Subnetting partitions an IP network into smaller logical segments. Borrowing 2 bits from /24 gives /26 (mask 255.255.255.192), yielding 4 subnets with 62 usable hosts each.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'CN-U5-2M-06',
    subjectId: 'cn',
    subjectName: 'Computer Networks',
    unit: 5,
    unitTitle: 'Application Layer & Network Security',
    question: 'What is the function of the Domain Name System (DNS)? Differentiate between Recursive and Iterative DNS queries.',
    marks: 2,
    yearsAsked: [2021, 2023, 2024],
    repeatCount: 3,
    isHighProbability: true,
    frequencyCategory: 'frequent',
    expectedKeywords: ['DNS', 'Recursive Query', 'Iterative Query', 'Domain Name', 'IP Resolution'],
    rubricGuide: {
      recommendedWordCount: { min: 30, max: 60 },
      structureRequirements: [
        'Purpose: Translating human-friendly domain names to IP addresses',
        'Recursive: Server takes complete responsibility to find answer; Iterative: Server refers client to next name server'
      ],
      keyConcepts: ['Name resolution', 'Query delegation']
    },
    modelAnswerSummary: 'DNS translates human-readable domain names into IP addresses. In recursive queries, the queried server resolves the full name on behalf of the client; in iterative queries, it returns referrals to downstream authoritative servers.',
    userStatus: 'not-started',
    userNotes: ''
  },

  // ==========================================
  // DATA STRUCTURES & ALGORITHMS (CS304)
  // ==========================================
  {
    id: 'DSA-U2-10M-01',
    subjectId: 'dsa',
    subjectName: 'Data Structures & Algorithms',
    unit: 2,
    unitTitle: 'Trees & Balanced Search Trees',
    question: 'Define an AVL Tree. Explain the Balance Factor and all four rotation cases (LL, RR, LR, RL) used to restore balance during insertion. Demonstrate with the sequence: 10, 20, 30, 40, 50, 25.',
    marks: 10,
    yearsAsked: [2021, 2022, 2023, 2024, 2025],
    repeatCount: 5,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['AVL Tree', 'Balance Factor', 'LL Rotation', 'RR Rotation', 'LR Rotation', 'RL Rotation', 'Height Balanced', 'O(log N)'],
    rubricGuide: {
      recommendedWordCount: { min: 200, max: 400 },
      structureRequirements: [
        'Definition: Height-balanced BST where Balance Factor = Height(Left) - Height(Right) in {-1, 0, 1}',
        'Diagram/explanation of single rotations (LL, RR) and double rotations (LR, RL)',
        'Step-by-step tree drawings showing each inserted element and triggered rotation',
        'Worst-case search, insert, and delete time complexity O(log n)'
      ],
      keyConcepts: ['Balance Factor range', 'Single vs Double Rotation', 'Rigid balance vs Red-Black Tree']
    },
    modelAnswerSummary: 'An AVL tree is a self-balancing binary search tree where heights of children differ by at most 1. Violations are rebalanced using single rotations (LL, RR) or double rotations (LR, RL), preserving O(log n) worst-case time complexity.',
    userStatus: 'needs-revision',
    userNotes: 'LR is Left rotation on left child, then Right rotation on root.'
  },
  {
    id: 'DSA-U4-10M-02',
    subjectId: 'dsa',
    subjectName: 'Data Structures & Algorithms',
    unit: 4,
    unitTitle: 'Graph Algorithms & Shortest Paths',
    question: 'Explain Dijkstra\'s Single Source Shortest Path algorithm with pseudocode. Analyze its time complexity using Adjacency Matrix vs Min-Heap with Adjacency List. Why does it fail for negative edge weights?',
    marks: 10,
    yearsAsked: [2021, 2022, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['Dijkstras Algorithm', 'Single Source Shortest Path', 'Min-Heap', 'Greedy Choice', 'Negative Weights', 'Relaxation', 'Time Complexity'],
    rubricGuide: {
      recommendedWordCount: { min: 180, max: 350 },
      structureRequirements: [
        'Greedy principle and relaxation condition: if dist[u] + w(u,v) < dist[v] then dist[v] = dist[u] + w(u,v)',
        'Time complexity: O(V^2) with matrix, O((V + E) log V) with Min-Heap',
        'Clear counterexample proving why greedy assumption breaks when negative edge weights exist',
        'Mention Bellman-Ford as the negative-weight solution'
      ],
      keyConcepts: ['Relaxation step', 'Greedy irreversible selection', 'Min-priority queue']
    },
    modelAnswerSummary: 'Dijkstra finds shortest paths from a source to all vertices using greedy edge relaxation. With a binary min-heap, complexity is O((V + E) log V). It fails on negative weight edges because it permanently marks visited vertices as optimal, which negative edges can later invalidate.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'DSA-U5-10M-03',
    subjectId: 'dsa',
    subjectName: 'Data Structures & Algorithms',
    unit: 5,
    unitTitle: 'Dynamic Programming & Greedy Algorithms',
    question: 'Solve the 0/1 Knapsack Problem using Dynamic Programming. Provide the recurrence relation, algorithm, and trace the DP table for items with weights {2, 3, 4, 5}, values {3, 4, 5, 6}, and capacity W = 5.',
    marks: 10,
    yearsAsked: [2021, 2023, 2024, 2025],
    repeatCount: 4,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['0/1 Knapsack', 'Dynamic Programming', 'Recurrence Relation', 'Optimal Substructure', 'Overlapping Subproblems', 'DP Table', 'Pseudo-polynomial'],
    rubricGuide: {
      recommendedWordCount: { min: 180, max: 350 },
      structureRequirements: [
        'Formal recurrence: K(i, w) = max(K(i-1, w), K(i-1, w - wt[i]) + val[i])',
        'Base cases K(0, w) = 0 and K(i, 0) = 0',
        'Complete DP grid calculation and backtracking to find included items',
        'Time and space complexity: O(N * W)'
      ],
      keyConcepts: ['Item inclusion vs exclusion', 'Backtracking chosen set', 'Contrast with Fractional Greedy']
    },
    modelAnswerSummary: '0/1 Knapsack cannot be solved greedily due to non-divisible items. Dynamic programming builds a table K[i][w] representing max profit with first i items and weight w. Recurrence chooses between including item i or excluding it, in O(N*W) time.',
    userStatus: 'not-started',
    userNotes: ''
  },
  {
    id: 'DSA-U3-5M-04',
    subjectId: 'dsa',
    subjectName: 'Data Structures & Algorithms',
    unit: 3,
    unitTitle: 'Priority Queues, Heaps & Hashing',
    question: 'Explain the HeapSort algorithm. Show the step-by-step Heapify process to build a Max-Heap from an unsorted array [12, 11, 13, 5, 6, 7] and analyze its time and space complexity.',
    marks: 5,
    yearsAsked: [2022, 2023, 2024],
    repeatCount: 3,
    isHighProbability: true,
    frequencyCategory: 'frequent',
    expectedKeywords: ['HeapSort', 'Max-Heap', 'Heapify', 'In-Place Sorting', 'Time Complexity O(N log N)', 'Complete Binary Tree'],
    rubricGuide: {
      recommendedWordCount: { min: 80, max: 170 },
      structureRequirements: [
        'Explanation of complete binary tree array representation (2i+1, 2i+2)',
        'Building heap in O(N) using bottom-up heapify',
        'Extract-max and swap-with-last in O(N log N)',
        'In-place auxiliary space O(1)'
      ],
      keyConcepts: ['Bottom-up build heap O(N)', 'Array indexing math', 'Comparison with QuickSort/MergeSort']
    },
    modelAnswerSummary: 'HeapSort converts an unsorted array into a Max-Heap in O(N) time, then repeatedly swaps the root with the last element and heapifies the reduced heap. Overall time complexity is O(N log N) in all cases, with O(1) auxiliary space.',
    userStatus: 'mastered',
    userNotes: ''
  },
  {
    id: 'DSA-U1-2M-05',
    subjectId: 'dsa',
    subjectName: 'Data Structures & Algorithms',
    unit: 1,
    unitTitle: 'Asymptotic Analysis & Linear Structures',
    question: 'State Master Theorem for solving divide-and-conquer recurrences of the form T(n) = aT(n/b) + f(n).',
    marks: 2,
    yearsAsked: [2021, 2022, 2023, 2024, 2025],
    repeatCount: 5,
    isHighProbability: true,
    frequencyCategory: 'critical',
    expectedKeywords: ['Master Theorem', 'Divide and Conquer', 'Asymptotic Complexity', 'Logarithmic Base', 'Recurrence Relation'],
    rubricGuide: {
      recommendedWordCount: { min: 30, max: 60 },
      structureRequirements: [
        'Form: T(n) = a*T(n/b) + O(n^d)',
        '3 Cases: d < log_b(a) -> O(n^(log_b a)), d = log_b(a) -> O(n^d log n), d > log_b(a) -> O(n^d)'
      ],
      keyConcepts: ['Comparison of root work f(n) vs leaves work n^(log_b a)']
    },
    modelAnswerSummary: 'Master theorem states for T(n) = aT(n/b) + O(n^d): Case 1: if d < log_b(a), T(n) = Θ(n^(log_b a)); Case 2: if d = log_b(a), T(n) = Θ(n^d * log n); Case 3: if d > log_b(a), T(n) = Θ(n^d).',
    userStatus: 'mastered',
    userNotes: ''
  }
];
