import { ConceptExplainer } from '../types';

export const CURATED_EXPLAINERS: Record<string, ConceptExplainer> = {
  // ==========================================
  // OPERATING SYSTEMS
  // ==========================================
  'os-deadlock': {
    topic: "Deadlocks & Banker's Algorithm",
    unitTitle: 'Synchronization & Deadlocks',
    subjectId: 'os',
    analogy: {
      title: 'Four Cars Trapped at a 4-Way Traffic Intersection',
      story: 'Imagine 4 cars arrive at an unregulated crossroads at the exact same moment. Each car moves forward into the center, blocking the car to its left while waiting for the car ahead to move. None can move forward, none can reverse. That is Circular Wait deadlock. The Banker\'s Algorithm is like a cautious traffic cop who checks if every car has enough fuel and space to safely clear the road before allowing any new car to enter!',
      keyTakeaway: 'Deadlock happens when processes hold resources while waiting for others in a closed cycle. Banker avoids this by never entering an "unsafe" state.'
    },
    architectureFlow: {
      title: 'Banker\'s Safety Algorithm State Machine',
      steps: [
        '1. Initialize Work = Available vector, Finish[i] = false for all i',
        '2. Find an index i such that: Finish[i] == false AND Need[i] <= Work',
        '3. If found: Work = Work + Allocation[i]; Finish[i] = true; Go to Step 2',
        '4. If Finish[i] == true for all i, system is in SAFE STATE (Safe Sequence exists!)'
      ],
      formulaOrRule: 'Need[i][j] = Max[i][j] - Allocation[i][j]'
    },
    examPoints: [
      'Deadlock requires 4 simultaneous Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.',
      'Banker\'s Algorithm maintains 4 core matrices: Available[m], Max[n][m], Allocation[n][m], Need[n][m].',
      'A state is considered Safe if there exists at least one order <P0, P1, ..., Pn> in which all processes can finish without deadlock.',
      'Draw the Resource Allocation table with columns: Process | Allocation | Max | Need | Available.'
    ],
    rubricKeywords: ['Safe State', 'Need Matrix', 'Available Vector', 'Circular Wait', 'Deadlock Avoidance', 'Resource Request'],
    flashcards: [
      {
        question: 'What is the formula to calculate the Need Matrix in Banker\'s Algorithm?',
        answer: 'Need[i][j] = Max[i][j] - Allocation[i][j]'
      },
      {
        question: 'What are the 4 Coffman conditions for a deadlock?',
        answer: 'Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.'
      },
      {
        question: 'Does an unsafe state guarantee an immediate deadlock?',
        answer: 'No! An unsafe state is not a deadlock, but deadlock can only occur from an unsafe state if processes demand their maximum declared resources.'
      }
    ]
  },

  'os-paging': {
    topic: 'Virtual Memory, Paging & TLB',
    unitTitle: 'Memory & Paging',
    subjectId: 'os',
    analogy: {
      title: 'A Mega Library with an Index Pocket Notebook (TLB)',
      story: 'Imagine reading a 1,000-page encyclopedia. Instead of running to the basement archives every time you need a fact (Main RAM), you keep a pocket notebook on your desk with the 10 most recent chapter page numbers (TLB). If it\'s in your notebook (TLB Hit), you find it in 1 second. If missing (TLB Miss), you must walk down to the card catalog, fetch the book, and jot it down.',
      keyTakeaway: 'Paging eliminates external fragmentation by splitting physical memory into fixed frames. TLB hardware cache speeds up address lookups from 2 memory trips to 1.'
    },
    architectureFlow: {
      title: 'CPU Logical to Physical Address Translation',
      steps: [
        '1. CPU generates Logical Address = (Page Number p, Offset d)',
        '2. Fast lookup: Check associative TLB hardware for page p',
        '3. If TLB Hit: Frame f retrieved instantly in t_tlb time',
        '4. If TLB Miss: Access Page Table in RAM, load Frame f, update TLB cache',
        '5. Physical Address formed: (Frame Number f, Offset d)'
      ],
      formulaOrRule: 'EMAT = h * (t_tlb + t_mem) + (1 - h) * (t_tlb + 2 * t_mem)'
    },
    examPoints: [
      'Paging eliminates external fragmentation, but can cause internal fragmentation on the last allocated frame.',
      'Page Table maps logical Page Number (p) to physical Frame Number (f). Offset (d) remains identical.',
      'Effective Memory Access Time (EMAT) depends heavily on TLB Hit Ratio (h).',
      'Belady\'s Anomaly occurs in FIFO where adding physical frames increases page faults; LRU is immune because it is a stack algorithm.'
    ],
    rubricKeywords: ['TLB Hit Ratio', 'EMAT Formula', 'Page Table', 'Internal Fragmentation', 'Frame Offset', 'Beladys Anomaly'],
    flashcards: [
      {
        question: 'Write the exact EMAT formula with hit ratio h.',
        answer: 'EMAT = h * (t_tlb + t_mem) + (1 - h) * (t_tlb + 2 * t_mem)'
      },
      {
        question: 'Why is LRU page replacement immune to Belady\'s Anomaly?',
        answer: 'Because LRU is a Stack Algorithm: the set of pages in N frames is always a strict subset of pages in N+1 frames.'
      }
    ]
  },

  // ==========================================
  // DATABASE SYSTEMS
  // ==========================================
  'dbms-normalization': {
    topic: 'Relational Normalization (1NF to BCNF)',
    unitTitle: 'SQL & Normalization',
    subjectId: 'dbms',
    analogy: {
      title: 'Organizing a Messy College Dorm Closet',
      story: 'Unnormalized data is like throwing clothes, shoes, gym gear, and text books into one giant pile—finding a shirt takes forever, and pulling out socks knocks over your laptop (Insertion/Deletion Anomaly). 1NF separates items into single boxes. 2NF ensures boxes only contain items matching the box label. 3NF removes indirect chains (like putting shoe polish inside a shirt box). BCNF ensures every label is a Master Key!',
      keyTakeaway: 'Normalization decomposes redundant tables into smaller, linked tables to eliminate update, insertion, and deletion anomalies without losing data.'
    },
    architectureFlow: {
      title: 'Normal Form Hierarchy (Strict Containment)',
      steps: [
        '1NF: All attribute values atomic (no comma lists or repeating groups)',
        '2NF: 1NF + No Partial Dependencies (non-prime depends on full candidate key)',
        '3NF: 2NF + No Transitive Dependencies (for X -> Y, X is superkey OR Y is prime)',
        'BCNF: For every non-trivial FD X -> Y, X MUST be a Superkey (Strict Key Rule!)'
      ],
      formulaOrRule: 'BCNF ⊂ 3NF ⊂ 2NF ⊂ 1NF'
    },
    examPoints: [
      'Functional Dependency X -> Y means value of X uniquely determines value of Y.',
      'Partial Dependency violates 2NF when a non-prime attribute depends on only a subset of a composite candidate key.',
      'Classic 3NF vs BCNF violation: R(Student, Subject, Teacher) with {Student, Subject} -> Teacher and Teacher -> Subject.',
      'Decomposition must guarantee two properties: Lossless Join (R1 ⋈ R2 = R) and Dependency Preservation.'
    ],
    rubricKeywords: ['BCNF', '3NF', 'Partial Dependency', 'Transitive Dependency', 'Superkey', 'Lossless Decomposition', 'Atomic Attribute'],
    flashcards: [
      {
        question: 'What is the strict rule for BCNF (Boyce-Codd Normal Form)?',
        answer: 'For every non-trivial Functional Dependency X -> Y, the determinant X MUST be a Superkey.'
      },
      {
        question: 'How do you test if a decomposition R1 and R2 is Lossless?',
        answer: '(R1 ∩ R2) -> R1 OR (R1 ∩ R2) -> R2 (The shared attribute must be a candidate key for at least one table).'
      }
    ]
  },

  'dbms-acid': {
    topic: 'ACID Properties & Conflict Serializability',
    unitTitle: 'Transactions & Concurrency',
    subjectId: 'dbms',
    analogy: {
      title: 'Withdrawing $100 from an ATM',
      story: 'If an ATM dispenses $100 cash, the bank MUST deduct $100 from your balance. If the machine runs out of paper receipts or network fails halfway, it must rollback completely (Atomicity). Two people using the same account at different ATMs simultaneously cannot both withdraw the last $100 (Isolation). Once your balance updates, power failure at the bank cannot erase the transaction (Durability).',
      keyTakeaway: 'ACID guarantees database reliability during crashes and simultaneous multi-user access.'
    },
    architectureFlow: {
      title: 'Precedence Graph Cycle Detection for Concurrency',
      steps: [
        '1. Conflict condition: Two ops access same item, different transactions, at least one WRITE',
        '2. Identify conflict pairs: Read-Write, Write-Read, Write-Write',
        '3. Draw directed edge Ti -> Tj if Ti executes its conflicting op before Tj',
        '4. Result: Schedule is Conflict Serializable <=> Precedence Graph has NO CYCLES!'
      ],
      formulaOrRule: 'Topological sort of Precedence Graph yields equivalent serial execution order.'
    },
    examPoints: [
      'Atomicity is enforced by Write-Ahead Logging (WAL) and undo logs.',
      'Two-Phase Locking (2PL) guarantees conflict serializability: Growing Phase (acquire locks) -> Lock Point -> Shrinking Phase (release locks).',
      'Strict 2PL prevents cascading rollbacks by holding exclusive locks until COMMIT.',
      'A schedule is view serializable if it is equivalent to a serial schedule based on initial read, updated write, and final write.'
    ],
    rubricKeywords: ['Conflict Serializability', 'Precedence Graph', 'Write-Ahead Log', 'Two-Phase Locking', 'Lock Point', 'Cascading Abort'],
    flashcards: [
      {
        question: 'What two operations conflict in database concurrency?',
        answer: 'Operations on the SAME data item, by DIFFERENT transactions, where at least ONE is a WRITE.'
      },
      {
        question: 'Does Basic Two-Phase Locking (2PL) prevent deadlocks?',
        answer: 'NO! Basic 2PL guarantees serializability, but transactions can still enter circular lock waits causing deadlocks.'
      }
    ]
  },

  // ==========================================
  // COMPUTER NETWORKS
  // ==========================================
  'cn-tcp': {
    topic: 'TCP Congestion Control & 3-Way Handshake',
    unitTitle: 'Transport Layer & TCP',
    subjectId: 'cn',
    analogy: {
      title: 'Testing a Fragile Highway with Speed Ramps',
      story: 'Imagine shipping packages across a suspension bridge. You start with 1 truck (Slow Start), then 2, 4, 8 trucks per minute (Exponential Growth). Once traffic builds up at the toll booth (ssthresh), you cautiously add only 1 truck per minute (Additive Increase). If 3 honks sound warning of a slowdown (3 Duplicate ACKs), you cut the truck count in half and keep rolling (Fast Recovery). If the bridge collapses, you reset back to 1 truck!',
      keyTakeaway: 'TCP AIMD dynamically adjusts cwnd transmission window to maximize network bandwidth without crashing routers.'
    },
    architectureFlow: {
      title: 'TCP Congestion Window (cwnd) State Transitions',
      steps: [
        '1. Slow Start: cwnd = 1 MSS; cwnd doubles every RTT until cwnd >= ssthresh',
        '2. Congestion Avoidance: Enters AIMD; cwnd increments by 1 MSS every RTT (Linear climb)',
        '3. On 3 Duplicate ACKs: Fast Retransmit lost packet; ssthresh = cwnd / 2; Enter Fast Recovery',
        '4. On Timeout: Catastrophic drop; ssthresh = cwnd / 2; cwnd resets to 1 MSS (Restart Slow Start)'
      ],
      formulaOrRule: 'AIMD: Additive Increase (+1 MSS / RTT), Multiplicative Decrease (÷2 on loss)'
    },
    examPoints: [
      'TCP 3-Way Handshake: SYN (seq=x) -> SYN-ACK (seq=y, ack=x+1) -> ACK (seq=x+1, ack=y+1).',
      '4-Way Connection Termination: FIN -> ACK from each direction; Client waits in TIME_WAIT state for 2*MSL.',
      'Draw the cwnd vs Transmission Round graph showing Slow Start, ssthresh threshold, and AIMD sawtooth curve.',
      'Flow Control protects the receiving application (rwnd); Congestion Control protects the intermediate network (cwnd).'
    ],
    rubricKeywords: ['AIMD', 'cwnd', 'ssthresh', 'Slow Start', 'Fast Retransmit', 'Fast Recovery', 'Three-Way Handshake', 'TIME_WAIT'],
    flashcards: [
      {
        question: 'What happens to cwnd and ssthresh when 3 Duplicate ACKs are received?',
        answer: 'ssthresh is set to cwnd / 2, and cwnd starts at ssthresh + 3 MSS in Fast Recovery (it does NOT drop to 1).'
      },
      {
        question: 'What are the packet flags in the TCP 3-Way Handshake?',
        answer: '1. SYN (seq=x)  2. SYN-ACK (seq=y, ack=x+1)  3. ACK (ack=y+1)'
      }
    ]
  },

  // ==========================================
  // DATA STRUCTURES
  // ==========================================
  'dsa-avl': {
    topic: 'AVL Tree Self-Balancing & 4 Rotations',
    unitTitle: 'Trees & AVL Balancing',
    subjectId: 'dsa',
    analogy: {
      title: 'A Mechanical Weighing Balance in a Jewelry Shop',
      story: 'A standard Binary Search Tree can degrade into a slow linked list O(N) if keys are inserted in sorted order (like piling all weights on one side of a scale). An AVL tree acts like a self-leveling precision scale: after every insertion, it measures the tilt of every branch (Balance Factor). If tilted by 2 or -2, it performs a quick mechanical pivot rotation (LL, RR, LR, RL) to restore perfect balance!',
      keyTakeaway: 'AVL trees enforce Balance Factor strictly in {-1, 0, +1}, guaranteeing O(log N) worst-case search, insertion, and deletion.'
    },
    architectureFlow: {
      title: 'AVL Four Rotation Decision Tree',
      steps: [
        'Calculate BF = Height(Left) - Height(Right)',
        'If BF > 1 (Left-Heavy):',
        '   - If new key inserted in Left child\'s Left subtree: Perform LL Rotation (Single Right Rotate)',
        '   - If new key inserted in Left child\'s Right subtree: Perform LR Rotation (Left rotate child, then Right rotate root)',
        'If BF < -1 (Right-Heavy):',
        '   - If new key inserted in Right child\'s Right subtree: Perform RR Rotation (Single Left Rotate)',
        '   - If new key inserted in Right child\'s Left subtree: Perform RL Rotation (Right rotate child, then Left rotate root)'
      ],
      formulaOrRule: 'Balance Factor: BF(node) = Height(node.left) - Height(node.right) ∈ {-1, 0, 1}'
    },
    examPoints: [
      'Worst-case search, insertion, and deletion are all strictly O(log N).',
      'Single Rotations: LL (Right rotate unbalanced node), RR (Left rotate unbalanced node).',
      'Double Rotations: LR (Left rotate left child, Right rotate node), RL (Right rotate right child, Left rotate node).',
      'Draw the 3-node triangular pivot before and after rotation to earn full marks.'
    ],
    rubricKeywords: ['Balance Factor', 'LL Rotation', 'RR Rotation', 'LR Rotation', 'RL Rotation', 'Height Balanced', 'O(log N)'],
    flashcards: [
      {
        question: 'What is the valid range of Balance Factor in an AVL Tree?',
        answer: 'Strictly {-1, 0, +1}. A node with BF = +2 or -2 is unbalanced and requires rotation.'
      },
      {
        question: 'Which rotation is required for a Left-Right (LR) imbalance?',
        answer: '1. Left Rotate on the Left Child, followed by 2. Right Rotate on the Unbalanced Node.'
      }
    ]
  }
};

// Fallback dynamic generator for any custom topic entered by the student
export function getConceptExplainer(topicKeyOrName: string, subjectId: string): ConceptExplainer {
  // Check exact key match
  if (CURATED_EXPLAINERS[topicKeyOrName]) {
    return CURATED_EXPLAINERS[topicKeyOrName];
  }

  // Check fuzzy topic match
  const lower = topicKeyOrName.toLowerCase();
  for (const [key, explainer] of Object.entries(CURATED_EXPLAINERS)) {
    if (explainer.subjectId === subjectId && (key.includes(lower) || explainer.topic.toLowerCase().includes(lower))) {
      return explainer;
    }
  }

  // Fallback to first topic of this subject if available
  const subjectTopics = Object.values(CURATED_EXPLAINERS).filter(e => e.subjectId === subjectId);
  if (subjectTopics.length > 0) {
    return subjectTopics[0];
  }

  // Synthesize dynamic 4-card breakdown for custom topic
  const cleanTitle = topicKeyOrName.charAt(0).toUpperCase() + topicKeyOrName.slice(1);
  return {
    topic: cleanTitle,
    unitTitle: 'Custom Study Unit',
    subjectId,
    analogy: {
      title: `The Simple Intuition Behind ${cleanTitle}`,
      story: `Think of ${cleanTitle} as a specialized structural rule in computer systems: it takes complex unstructured operations and creates clear, deterministic boundaries so concurrent processes and algorithms execute reliably without collisions.`,
      keyTakeaway: `Mastering ${cleanTitle} requires understanding the core inputs, the invariant transformation rules, and the final deterministic output.`
    },
    architectureFlow: {
      title: `${cleanTitle} Execution & Architecture Flow`,
      steps: [
        `1. Initialize prerequisite data structures and verify entry invariants for ${cleanTitle}`,
        `2. Process state transitions step-by-step according to the governing protocol`,
        `3. Detect boundary conditions or error states and apply resolution handlers`,
        `4. Commit final results and update tracking telemetry`
      ],
      formulaOrRule: `Optimal Complexity: O(log N) to O(N) depending on implementation constraints.`
    },
    examPoints: [
      `Define ${cleanTitle} clearly in the opening 2 sentences of your university answer paper.`,
      `Draw a clean block architecture diagram showing component interactions and data flow.`,
      `State the primary advantages, trade-offs, and edge-case failure modes.`,
      `Provide a concrete pseudocode or numerical calculation example to guarantee 10/10 marks.`
    ],
    rubricKeywords: [cleanTitle, 'Time Complexity', 'Algorithm Flow', 'Edge Cases', 'Architecture', 'Trade-offs'],
    flashcards: [
      {
        question: `What is the primary function of ${cleanTitle}?`,
        answer: `To coordinate structured execution, maintain systemic invariants, and guarantee optimal performance.`
      },
      {
        question: `What diagram should you draw in the exam for ${cleanTitle}?`,
        answer: `A state transition diagram or block architecture diagram highlighting inputs, transformations, and outputs.`
      }
    ]
  };
}
