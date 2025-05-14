
import { useState, useEffect } from "react";
import {
  auth, db, provider, signInWithPopup, signOut, doc, getDoc, setDoc
} from "./firebase";

export default function App() {
  const [user, setUser] = useState(null);
  const [note, setNote] = useState("");
  const [timetable, setTimetable] = useState(Array(5).fill(""));
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedNote = localStorage.getItem("note");
    const storedTimetable = JSON.parse(localStorage.getItem("timetable") || "[]");
    setNote(storedNote || "");
    setTimetable(storedTimetable);
  }, []);

  useEffect(() => {
    localStorage.setItem("note", note);
  }, [note]);

  useEffect(() => {
    localStorage.setItem("timetable", JSON.stringify(timetable));
  }, [timetable]);

  const handleLogin = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
    const userDoc = await getDoc(doc(db, "users", result.user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setNote(data.note || "");
      setTimetable(data.timetable || Array(5).fill(""));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const saveToCloud = async () => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), {
      note,
      timetable
    });
    alert("저장 완료!");
  };

  return (
    <div style={{
      backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
      color: darkMode ? '#ffffff' : '#000000',
      minHeight: '100vh',
      padding: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1>🎓 내 학교 포털</h1>
        <div>
          <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? "☀️" : "🌙"}</button>
          {user ? (
            <button onClick={handleLogout}>로그아웃</button>
          ) : (
            <button onClick={handleLogin}>Google 로그인</button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { name: "급식표", url: "https://school.koreacharts.com/school/meals/B000023143/contents.html", icon: "📘" },
          { name: "구글 클래스룸", url: "http://classroom.google.com/?pli=1", icon: "💬" },
          { name: "구글 챗", url: "https://mail.google.com/chat/u/0/#chat/home", icon: "💬" },
        ].map((link, idx) => (
          <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" style={{
            textDecoration: 'none',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '1rem',
            flex: '1 0 30%',
            textAlign: 'center',
            backgroundColor: darkMode ? '#333' : '#f9f9f9',
            color: darkMode ? '#fff' : '#000'
          }}>
            <div style={{ fontSize: '2rem' }}>{link.icon}</div>
            <div>{link.name}</div>
          </a>
        ))}
      </div>

      <h2>🕐 시간표 작성</h2>
      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '2rem' }}>
        {timetable.map((item, i) => (
          <input
            key={i}
            value={item}
            onChange={(e) => {
              const updated = [...timetable];
              updated[i] = e.target.value;
              setTimetable(updated);
            }}
            placeholder={`교시 ${i + 1} 내용 입력`}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        ))}
      </div>

      <h2>📝 메모</h2>
      <textarea
        rows={4}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="오늘 해야 할 일, 중요한 일정 등을 메모하세요"
        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem' }}
      />

      {user && <button onClick={saveToCloud}>☁️ 클라우드에 저장</button>}
    </div>
  );
}
