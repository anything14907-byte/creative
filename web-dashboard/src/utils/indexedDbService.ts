import { SubjectMeta, SubjectFile, FileCategory, SubjectNote, VideoResource, HubBackupData } from '../types';
import { storageService, DEFAULT_SUBJECTS } from './storageService';

const DB_NAME = 'PyqRankerHubDB';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Subjects store
      if (!db.objectStoreNames.contains('subjects')) {
        db.createObjectStore('subjects', { keyPath: 'id' });
      }

      // 2. Files store (PDFs, images, notes)
      if (!db.objectStoreNames.contains('files')) {
        const fileStore = db.createObjectStore('files', { keyPath: 'id' });
        fileStore.createIndex('subjectId', 'subjectId', { unique: false });
        fileStore.createIndex('category', 'category', { unique: false });
        fileStore.createIndex('subject_category', ['subjectId', 'category'], { unique: false });
      }

      // 3. Subject Notes (freeform text area)
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'subjectId' });
      }

      // 4. Videos (YouTube lecture vault)
      if (!db.objectStoreNames.contains('videos')) {
        const videoStore = db.createObjectStore('videos', { keyPath: 'id' });
        videoStore.createIndex('subjectId', 'subjectId', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Generate demo files so the dashboard is immediately rich and useful
function createDemoSvgDataUrl(title: string, subtitle: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
    <rect width="800" height="1000" fill="#0A0F24"/>
    <rect x="20" y="20" width="760" height="960" rx="16" fill="#0F172A" stroke="${color}" stroke-width="2"/>
    <circle cx="400" cy="200" r="80" fill="${color}" opacity="0.15"/>
    <text x="400" y="210" fill="${color}" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">PyqRanker Document</text>
    <line x1="80" y1="320" x2="720" y2="320" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
    <text x="400" y="380" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="32" font-weight="bold" text-anchor="middle">${title}</text>
    <text x="400" y="430" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="20" text-anchor="middle">${subtitle}</text>
    
    <rect x="80" y="490" width="640" height="140" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
    <text x="110" y="540" fill="${color}" font-family="system-ui, sans-serif" font-size="18" font-weight="bold">KEY REVISION TOPICS:</text>
    <text x="110" y="580" fill="#E2E8F0" font-family="monospace" font-size="16">• Core Concepts, Formulas & Exam Rubric</text>
    <text x="110" y="610" fill="#E2E8F0" font-family="monospace" font-size="16">• Past 5-Year High Frequency Questions</text>
    
    <rect x="80" y="660" width="640" height="240" rx="12" fill="rgba(255,255,255,0.02)"/>
    <text x="110" y="710" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="15">Stored locally in your browser's IndexedDB.</text>
    <text x="110" y="740" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="15">Full screen zoom, rename, tab moving and done-tracking enabled.</text>
    <circle cx="400" cy="830" r="30" fill="${color}" opacity="0.3"/>
    <text x="400" y="838" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">✓</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function getInitialDemoFiles(): SubjectFile[] {
  const now = Date.now();
  return [
    // OS Files
    {
      id: 'demo-os-pyq-2024',
      subjectId: 'os',
      name: '2024 End-Semester University Exam Paper.pdf',
      category: 'pyq',
      fileType: 'pdf',
      dataUrl: createDemoSvgDataUrl('2024 End-Semester Examination', 'Operating Systems (CS401) • 100 Marks', '#00E599'),
      size: 420000,
      year: '2024',
      examType: 'End Sem',
      isImportant: true,
      isDone: false,
      createdAt: now - 86400000 * 3
    },
    {
      id: 'demo-os-pyq-2023',
      subjectId: 'os',
      name: '2023 Mid-Semester Exam Paper with Solutions.pdf',
      category: 'pyq',
      fileType: 'pdf',
      dataUrl: createDemoSvgDataUrl('2023 Mid-Semester Paper', 'Process Scheduling & Deadlocks • 50 Marks', '#00E599'),
      size: 380000,
      year: '2023',
      examType: 'Mid Sem',
      isImportant: false,
      isDone: true,
      createdAt: now - 86400000 * 5
    },
    {
      id: 'demo-os-notes-1',
      subjectId: 'os',
      name: 'Prof. Rao — CPU Scheduling Algorithms & Gantt Charts.pdf',
      category: 'notes',
      fileType: 'pdf',
      dataUrl: createDemoSvgDataUrl('Lecture 12 Notes — CPU Scheduling', 'FCFS, SJF, SRTF, Priority & Round Robin Formulas', '#38BDF8'),
      size: 512000,
      date: 'Oct 14, 2026',
      isImportant: true,
      isDone: false,
      createdAt: now - 86400000 * 2
    },
    {
      id: 'demo-os-img-1',
      subjectId: 'os',
      name: 'Process State Transition Diagram & PCB Memory Layout.png',
      category: 'images',
      fileType: 'image',
      dataUrl: createDemoSvgDataUrl('Process State Transitions', 'New → Ready → Running → Waiting → Terminated', '#FFB800'),
      size: 290000,
      isImportant: true,
      isDone: false,
      createdAt: now - 86400000 * 4
    },

    // DBMS Files
    {
      id: 'demo-dbms-pyq-2024',
      subjectId: 'dbms',
      name: '2024 End-Semester DBMS University Paper.pdf',
      category: 'pyq',
      fileType: 'pdf',
      dataUrl: createDemoSvgDataUrl('2024 End Sem DBMS Paper', 'Normalization, ACID & B+ Trees • 100 Marks', '#38BDF8'),
      size: 450000,
      year: '2024',
      examType: 'End Sem',
      isImportant: true,
      isDone: false,
      createdAt: now - 86400000 * 3
    },
    {
      id: 'demo-dbms-notes-1',
      subjectId: 'dbms',
      name: 'Teacher Notes — B+ Tree Insertion & Deletion Steps.pdf',
      category: 'notes',
      fileType: 'pdf',
      dataUrl: createDemoSvgDataUrl('B+ Tree Indexing Guide', 'Step-by-step leaf splitting and root updates', '#00E599'),
      size: 380000,
      date: 'Oct 18, 2026',
      isImportant: false,
      isDone: true,
      createdAt: now - 86400000 * 6
    },
    {
      id: 'demo-dbms-img-1',
      subjectId: 'dbms',
      name: 'Whiteboard Photo — ER Diagram to Relational Schema Rules.png',
      category: 'images',
      fileType: 'image',
      dataUrl: createDemoSvgDataUrl('ER to Table Mapping Rules', 'Cardinality Ratios 1:1, 1:N, M:N Primary Keys', '#FFB800'),
      size: 340000,
      isImportant: true,
      isDone: false,
      createdAt: now - 86400000 * 2
    },

    // CN Files
    {
      id: 'demo-cn-pyq-2023',
      subjectId: 'cn',
      name: '2023 End-Semester Computer Networks Paper.pdf',
      category: 'pyq',
      fileType: 'pdf',
      dataUrl: createDemoSvgDataUrl('2023 End Sem CN Paper', 'OSI vs TCP/IP, Subnetting & Routing Algorithms', '#FFB800'),
      size: 410000,
      year: '2023',
      examType: 'End Sem',
      isImportant: true,
      isDone: false,
      createdAt: now - 86400000 * 5
    },
    {
      id: 'demo-cn-notes-1',
      subjectId: 'cn',
      name: 'Teacher Handout — IPv4 Subnetting & CIDR Cheat Sheet.pdf',
      category: 'notes',
      fileType: 'pdf',
      dataUrl: createDemoSvgDataUrl('CIDR Subnetting Formulas', 'Subnet Mask, Host Bits, Broadcast Address Formulas', '#00E599'),
      size: 320000,
      date: 'Oct 20, 2026',
      isImportant: true,
      isDone: false,
      createdAt: now - 86400000 * 1
    },

    // DSA Files
    {
      id: 'demo-dsa-pyq-2024',
      subjectId: 'dsa',
      name: '2024 Mid-Sem DSA Trees and Graphs Paper.pdf',
      category: 'pyq',
      fileType: 'pdf',
      dataUrl: createDemoSvgDataUrl('2024 Mid Sem DSA Paper', 'AVL Tree Rotations, Dijkstra & Prim • 50 Marks', '#FF5757'),
      size: 360000,
      year: '2024',
      examType: 'Mid Sem',
      isImportant: true,
      isDone: true,
      createdAt: now - 86400000 * 4
    },
    {
      id: 'demo-dsa-img-1',
      subjectId: 'dsa',
      name: 'Handwritten Notes — AVL Tree LL, RR, LR, RL Rotations.png',
      category: 'images',
      fileType: 'image',
      dataUrl: createDemoSvgDataUrl('AVL Tree Balance Factors', 'LL, RR, LR, RL Rotation Diagrams & Pseudocode', '#38BDF8'),
      size: 310000,
      isImportant: true,
      isDone: false,
      createdAt: now - 86400000 * 2
    }
  ];
}

function getInitialDemoNotes(subjectId: string): string {
  switch (subjectId) {
    case 'os':
      return `# Operating Systems — My Exam Cheat Sheet & Formulas

## 1. CPU Scheduling Formulas
- Turnaround Time (TAT) = Completion Time - Arrival Time
- Waiting Time (WT) = TAT - Burst Time
- Response Time = First CPU Allocation Time - Arrival Time

## 2. Banker's Algorithm Safety Test
- Need Matrix = Max Matrix - Allocation Matrix
- If Need <= Work, then Work = Work + Allocation; mark process finished.

## 3. Page Replacement
- FIFO: First In First Out (suffers from Belady's Anomaly)
- LRU: Least Recently Used (stack-based, no Belady's Anomaly)
- Optimal: Replaces page that will not be used for longest time in future.
`;
    case 'dbms':
      return `# DBMS Quick Revision Notes

## 1. Normal Forms Summary
- 1NF: Atomic values only, no multi-valued attributes.
- 2NF: In 1NF and no partial dependencies (Non-prime attribute fully functionally dependent on Candidate Key).
- 3NF: In 2NF and no transitive dependencies (For X -> A, either X is Super Key or A is Prime Attribute).
- BCNF: For every FD X -> A, X must be a Super Key.

## 2. ACID Properties
- Atomicity (All or None - managed by Recovery Manager)
- Consistency (Database remains in valid state before & after transaction)
- Isolation (Transactions execute without interference - Concurrency Control)
- Durability (Committed changes survive system crashes - Log manager)
`;
    case 'cn':
      return `# Computer Networks Revision Notes

## 1. OSI 7-Layer Protocol Stack
- Physical (Bits, Cables, Hubs)
- Data Link (Frames, MAC, Switches, CRC)
- Network (Packets, IP, Routers, OSPF/BGP)
- Transport (Segments, TCP/UDP, Ports, Flow Control)
- Session (Dialog control, Token management)
- Presentation (Encoding, Encryption, Compression)
- Application (HTTP, DNS, SMTP, FTP)

## 2. Subnetting Formula
- Number of Subnets = 2^(subnet bits)
- Usable Hosts per Subnet = 2^(host bits) - 2
`;
    case 'dsa':
      return `# Data Structures & Algorithms Key Points

## 1. Time Complexities
- QuickSort: Best O(N log N), Worst O(N^2)
- MergeSort: Always O(N log N)
- HeapSort: Always O(N log N)
- Binary Search: O(log N)

## 2. Graph Algorithms
- BFS: Uses Queue, Shortest path in unweighted graph O(V + E)
- DFS: Uses Stack / Recursion, Topological Sort, Cycle detection
- Dijkstra: Greedy, Shortest path with non-negative edge weights O((V + E) log V)
`;
    default:
      return `# Personal Study Notes for this Subject\n\n- Write formulas, key definitions, and exam reminders here.\n- Auto-saved instantly to your browser's IndexedDB.`;
  }
}

export const indexedDbService = {
  // ==========================================
  // SUBJECTS CRUD
  // ==========================================
  async getSubjects(): Promise<SubjectMeta[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('subjects', 'readonly');
      const store = tx.objectStore('subjects');
      const req = store.getAll();

      req.onsuccess = async () => {
        let subjects: SubjectMeta[] = req.result || [];

        // If empty in IndexedDB, migrate from localStorage or seed rich defaults
        if (subjects.length === 0) {
          const localSaved = storageService.getSubjects();
          if (localSaved && localSaved.length > 0) {
            subjects = localSaved;
          } else {
            subjects = DEFAULT_SUBJECTS;
          }

          // Populate IndexedDB
          await this.saveAllSubjects(subjects);

          // Also seed demo files if files store is empty
          const fileCount = await this.getFileCount();
          if (fileCount === 0) {
            await this.addFiles(getInitialDemoFiles());
            // Seed initial notes
            for (const s of subjects) {
              await this.saveNotes(s.id, getInitialDemoNotes(s.id));
            }
          }
        }

        resolve(subjects);
      };

      req.onerror = () => reject(req.error);
    });
  },

  async saveSubject(subject: SubjectMeta): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('subjects', 'readwrite');
      const store = tx.objectStore('subjects');
      const req = store.put(subject);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async saveAllSubjects(subjects: SubjectMeta[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('subjects', 'readwrite');
      const store = tx.objectStore('subjects');
      subjects.forEach(s => store.put(s));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async deleteSubject(subjectId: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['subjects', 'files', 'notes', 'videos'], 'readwrite');

      // 1. Delete subject
      tx.objectStore('subjects').delete(subjectId);

      // 2. Cascade delete files
      const fileStore = tx.objectStore('files');
      const fileIndex = fileStore.index('subjectId');
      const fileReq = fileIndex.getAllKeys(subjectId);
      fileReq.onsuccess = () => {
        const fileKeys = fileReq.result || [];
        fileKeys.forEach(k => fileStore.delete(k));
      };

      // 3. Cascade delete notes
      tx.objectStore('notes').delete(subjectId);

      // 4. Cascade delete videos
      const videoStore = tx.objectStore('videos');
      const videoIndex = videoStore.index('subjectId');
      const videoReq = videoIndex.getAllKeys(subjectId);
      videoReq.onsuccess = () => {
        const videoKeys = videoReq.result || [];
        videoKeys.forEach(k => videoStore.delete(k));
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  // ==========================================
  // FILES CRUD (PDFs, Images, Notes)
  // ==========================================
  async getFiles(subjectId?: string): Promise<SubjectFile[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');

      let req: IDBRequest<SubjectFile[]>;
      if (subjectId) {
        const index = store.index('subjectId');
        req = index.getAll(subjectId);
      } else {
        req = store.getAll();
      }

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async getFileCount(subjectId?: string): Promise<number> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');

      let req: IDBRequest<number>;
      if (subjectId) {
        const index = store.index('subjectId');
        req = index.count(subjectId);
      } else {
        req = store.count();
      }

      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => reject(req.error);
    });
  },

  async addFile(file: SubjectFile): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      const req = store.put(file);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async addFiles(files: SubjectFile[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      files.forEach(f => store.put(f));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async updateFile(file: SubjectFile): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      const updated = { ...file, updatedAt: Date.now() };
      const req = store.put(updated);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async deleteFile(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async moveFile(id: string, newCategory: FileCategory): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const file: SubjectFile | undefined = getReq.result;
        if (file) {
          file.category = newCategory;
          file.updatedAt = Date.now();
          store.put(file);
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async toggleFileImportant(id: string): Promise<boolean> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      const getReq = store.get(id);
      let newState = false;

      getReq.onsuccess = () => {
        const file: SubjectFile | undefined = getReq.result;
        if (file) {
          newState = !file.isImportant;
          file.isImportant = newState;
          file.updatedAt = Date.now();
          store.put(file);
        }
      };

      tx.oncomplete = () => resolve(newState);
      tx.onerror = () => reject(tx.error);
    });
  },

  async toggleFileDone(id: string): Promise<boolean> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      const getReq = store.get(id);
      let newState = false;

      getReq.onsuccess = () => {
        const file: SubjectFile | undefined = getReq.result;
        if (file) {
          newState = !file.isDone;
          file.isDone = newState;
          file.updatedAt = Date.now();
          store.put(file);
        }
      };

      tx.oncomplete = () => resolve(newState);
      tx.onerror = () => reject(tx.error);
    });
  },

  // ==========================================
  // SUBJECT NOTES CRUD
  // ==========================================
  async getNotes(subjectId: string): Promise<string> {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('notes', 'readonly');
      const store = tx.objectStore('notes');
      const req = store.get(subjectId);
      req.onsuccess = () => {
        const note: SubjectNote | undefined = req.result;
        resolve(note ? note.content : '');
      };
      req.onerror = () => resolve('');
    });
  },

  async saveNotes(subjectId: string, content: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('notes', 'readwrite');
      const store = tx.objectStore('notes');
      const note: SubjectNote = {
        subjectId,
        content,
        lastUpdated: Date.now()
      };
      const req = store.put(note);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  // ==========================================
  // VIDEOS (YOUTUBE VAULT)
  // ==========================================
  async getVideos(subjectId?: string): Promise<VideoResource[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('videos', 'readonly');
      const store = tx.objectStore('videos');

      let req: IDBRequest<VideoResource[]>;
      if (subjectId) {
        const index = store.index('subjectId');
        req = index.getAll(subjectId);
      } else {
        req = store.getAll();
      }

      req.onsuccess = () => {
        let list: VideoResource[] = req.result || [];
        // If empty, pull from local storage demo
        if (list.length === 0 && !subjectId) {
          list = storageService.getVideos();
          indexedDbService.saveAllVideos(list);
        }
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  },

  async saveVideo(video: VideoResource): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('videos', 'readwrite');
      const store = tx.objectStore('videos');
      const req = store.put(video);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async saveAllVideos(videos: VideoResource[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('videos', 'readwrite');
      const store = tx.objectStore('videos');
      videos.forEach(v => store.put(v));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async deleteVideo(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('videos', 'readwrite');
      const store = tx.objectStore('videos');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async toggleVideoWatched(id: string): Promise<boolean> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('videos', 'readwrite');
      const store = tx.objectStore('videos');
      const req = store.get(id);
      let nextState = false;

      req.onsuccess = () => {
        const video: VideoResource | undefined = req.result;
        if (video) {
          nextState = !video.isWatched;
          video.isWatched = nextState;
          store.put(video);
        }
      };

      tx.oncomplete = () => resolve(nextState);
      tx.onerror = () => reject(tx.error);
    });
  },

  async updateVideoNotes(id: string, notes: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('videos', 'readwrite');
      const store = tx.objectStore('videos');
      const req = store.get(id);

      req.onsuccess = () => {
        const video: VideoResource | undefined = req.result;
        if (video) {
          video.notes = notes;
          store.put(video);
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  // ==========================================
  // STORAGE USAGE ESTIMATOR
  // ==========================================
  async getStorageUsage(): Promise<{ totalBytes: number; formatted: string; fileCount: number }> {
    const files = await this.getFiles();
    let totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);

    // If browser navigator.storage.estimate is available, also compare
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage && estimate.usage > totalBytes) {
          totalBytes = estimate.usage;
        }
      } catch (e) {
        // Fallback to computed totalBytes
      }
    }

    let formatted = '0 KB';
    if (totalBytes > 1024 * 1024) {
      formatted = (totalBytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else if (totalBytes > 1024) {
      formatted = (totalBytes / 1024).toFixed(0) + ' KB';
    } else {
      formatted = totalBytes + ' Bytes';
    }

    return {
      totalBytes,
      formatted,
      fileCount: files.length
    };
  },

  // ==========================================
  // EXPORT / IMPORT BACKUP (JSON)
  // ==========================================
  async exportCompleteBackup(): Promise<string> {
    const subjects = await this.getSubjects();
    const files = await this.getFiles();
    const videos = await this.getVideos();

    // Collect all notes
    const db = await openDB();
    const notes: SubjectNote[] = await new Promise((resolve) => {
      const tx = db.transaction('notes', 'readonly');
      const store = tx.objectStore('notes');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    const storageUsage = await this.getStorageUsage();

    const backupPayload: HubBackupData = {
      version: 'pyqranker_idb_v1',
      exportedAt: new Date().toISOString(),
      subjects,
      files,
      notes,
      videos,
      storageBytes: storageUsage.totalBytes
    };

    const jsonStr = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PyqRanker_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return jsonStr;
  },

  async importCompleteBackup(jsonContent: string): Promise<{ success: boolean; message: string }> {
    try {
      const parsed: HubBackupData = JSON.parse(jsonContent);

      if (!parsed || !Array.isArray(parsed.subjects)) {
        return {
          success: false,
          message: 'Invalid backup file format. Missing subjects array.'
        };
      }

      const db = await openDB();

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(['subjects', 'files', 'notes', 'videos'], 'readwrite');

        // Clear existing data
        tx.objectStore('subjects').clear();
        tx.objectStore('files').clear();
        tx.objectStore('notes').clear();
        tx.objectStore('videos').clear();

        // Restore subjects
        const subjectStore = tx.objectStore('subjects');
        parsed.subjects.forEach(s => subjectStore.put(s));

        // Restore files
        if (Array.isArray(parsed.files)) {
          const fileStore = tx.objectStore('files');
          parsed.files.forEach(f => fileStore.put(f));
        }

        // Restore notes
        if (Array.isArray(parsed.notes)) {
          const notesStore = tx.objectStore('notes');
          parsed.notes.forEach(n => notesStore.put(n));
        }

        // Restore videos
        if (Array.isArray(parsed.videos)) {
          const videoStore = tx.objectStore('videos');
          parsed.videos.forEach(v => videoStore.put(v));
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });

      return {
        success: true,
        message: `Successfully restored ${parsed.subjects.length} subjects and ${parsed.files?.length || 0} files!`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error importing backup: ${err.message || 'Corrupted file'}`
      };
    }
  }
};
