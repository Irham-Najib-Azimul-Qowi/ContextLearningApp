import { repository } from "../lib/db/repository";

console.log("--- REPOSITORY SAVE & RETRIEVAL DIAGNOSTIC ---");
const activeSchool = repository.getActiveSchool();
const currentUser = repository.getCurrentUser();
console.log("ActiveSchool:", activeSchool.id, activeSchool.name);
console.log("CurrentUser:", currentUser.id, currentUser.full_name);

// Scenario 1: User saves question
const questionId = repository.getNextQuestionId();
const saved = repository.saveQuestion({
  id: questionId,
  school_id: activeSchool.id,
  subject: "Matematika",
  grade: 5,
  topic: "Operasi Pecahan Pasar Madiun",
  items: [
    {
      id: "item-1",
      type: "multiple_choice",
      question_text: "Pak Budi menjual 3/4 kg beras...",
      options: [
        { key: "A", text: "750 gram" },
        { key: "B", text: "500 gram" },
      ],
      correct_answer: "A",
      explanation: "3/4 kg = 750 gram",
    },
  ],
  teacher_id: currentUser.id,
  is_contextualized: true,
});

console.log("Saved Question ID:", saved.id);

// Check retrieval with { schoolId: activeSchool.id }
const retrievedFiltered = repository.getQuestions({ schoolId: activeSchool.id });
console.log("Retrieved with schoolId filter count:", retrievedFiltered.length);
console.log("Is saved question in retrieved?", retrievedFiltered.some((q) => q.id === saved.id));

// Check retrieval with active schoolId
const retrievedCustom = repository.getQuestions({ schoolId: "school-active" });
console.log("Retrieved with school-active filter count:", retrievedCustom.length);
console.log("Is saved question in custom filter?", retrievedCustom.some((q) => q.id === saved.id));

// Scenario 2: What if school_id in question is "school-active" but query is for activeSchool.id?
const saved2 = repository.saveQuestion({
  school_id: "school-active",
  subject: "IPAS (Ilmu Pengetahuan Alam & Sosial)",
  grade: 5,
  topic: "Ekosistem Hutan",
  items: [{
    id: "item-2",
    type: "essay",
    question_text: "Jelaskan rantai makanan di Gunung Wilis...",
    correct_answer: "",
    explanation: "Produsen -> Konsumen",
  }],
  teacher_id: "usr-teacher-01",
  is_contextualized: true,
});

const retrievedActive = repository.getQuestions({ schoolId: activeSchool.id });
console.log("Is saved2 in retrievedActive?", retrievedActive.some((q) => q.id === saved2.id));

// Scenario 3: Materials
const newMat = repository.saveMaterial({
  title: "Materi Baru Kontekstual",
  content: "Konten materi...",
  subject: "Matematika",
  grade: 5,
  school_id: activeSchool.id,
  teacher_id: currentUser.id,
});
console.log("Saved Material ID:", newMat.id);
const retrievedMats = repository.getMaterials(activeSchool.id);
console.log("Is newMat in retrievedMats?", retrievedMats.some((m) => m.id === newMat.id));

// Scenario 4: Rooms
const newRoom = repository.createRoom({
  title: "Room Ujian Baru",
  subject: "Matematika",
  grade: 5,
  type: "question",
  resource_id: saved.id,
  teacher_id: currentUser.id,
  teacher_name: currentUser.full_name,
});
console.log("Saved Room Code:", newRoom.code);
const retrievedRooms = repository.getRooms(currentUser.id);
console.log("Is newRoom in retrievedRooms?", retrievedRooms.some((r) => r.code === newRoom.code));
