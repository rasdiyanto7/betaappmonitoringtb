/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { UserProfile, PatientQuestion, UserRole } from "../types";
import { FAQ_DATABASE } from "../data/mockDB";
import { 
  MessageSquare, Phone, Send, User, Bot, HelpCircle, ChevronDown, 
  ChevronUp, Lock, SendHorizonal, CheckCircle, Clock, AlertCircle, Sparkles 
} from "lucide-react";

interface KonsultasiProps {
  currentUser: UserProfile;
  questions: PatientQuestion[];
  onAddQuestion: (text: string) => void;
  onAnswerQuestion: (id: string, answer: string, author: string) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Konsultasi({ 
  currentUser, 
  questions, 
  onAddQuestion, 
  onAnswerQuestion 
}: KonsultasiProps) {
  const isKaderOrMedis = currentUser.role === UserRole.KADER || currentUser.role === UserRole.MEDIS;

  // Tabs for Patient vs Kader/Medis
  const [activeTab, setActiveTab] = useState<string>(isKaderOrMedis ? "belum_dijawab" : "tanya_kader");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Patient states
  const [newQuestionText, setNewQuestionText] = useState("");
  const [msgSuccessPatient, setMsgSuccessPatient] = useState("");

  // Kader/Medis states
  const [answerInputs, setAnswerInputs] = useState<{ [questionId: string]: string }>({});
  const [msgSuccessStaff, setMsgSuccessStaff] = useState("");

  // AI chat states (only for Patient)
  const [aiMessage, setAiMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      role: "assistant",
      content: "Halo! Saya adalah Asisten AI PeduliTB. Ada yang bisa saya bantu terkait penyakit Tuberkulosis (TB), aturan konsumsi OAT, efek samping, atau pemenuhan nutrisi Anda hari ini?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  // Actions
  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    onAddQuestion(newQuestionText.trim());
    setNewQuestionText("");
    setMsgSuccessPatient("Pertanyaan Anda berhasil dikirim ke Kader & Dokter Pendamping Anda.");
    setTimeout(() => setMsgSuccessPatient(""), 4000);
  };

  const handleAnswerSubmit = (e: React.FormEvent, questionId: string) => {
    e.preventDefault();
    const ansText = answerInputs[questionId];
    if (!ansText || !ansText.trim()) return;

    onAnswerQuestion(questionId, ansText.trim(), currentUser.nama);
    setAnswerInputs(prev => ({ ...prev, [questionId]: "" }));
    setMsgSuccessStaff("Jawaban Anda berhasil disimpan dan dikirim ke pasien secara aman.");
    setTimeout(() => setMsgSuccessStaff(""), 4000);
  };

  // Gemini AI Chat request handler
  const handleSendAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim() || isLoading) return;

    const userText = aiMessage.trim();
    setAiMessage("");
    setErrorMessage("");

    const updatedHistory = [...chatHistory, { role: "user", content: userText } as Message];
    setChatHistory(updatedHistory);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: updatedHistory.slice(1, -1)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setChatHistory(prev => [...prev, { role: "assistant", content: data.text }]);
      } else {
        setErrorMessage(data.error || "Gagal menghubungi Asisten AI.");
      }
    } catch (error) {
      console.error("AI fetch error:", error);
      setErrorMessage("Koneksi gagal. Silakan periksa jaringan internet Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render for Kader and Medis (Staff)
  if (isKaderOrMedis) {
    const unansweredQuestions = questions.filter(q => q.status === "Belum Dijawab");
    const answeredQuestions = questions.filter(q => q.status === "Sudah Dijawab");

    return (
      <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
        {/* Title and stats Header */}
        <div className="p-4 bg-white border-b border-slate-200/80 sticky top-0 z-10 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" /> Tanya Jawab Pasien
            </h2>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-100">
              {currentUser.role === UserRole.KADER ? "Kader TB" : "Tenaga Medis"}
            </span>
          </div>

          {/* Sub tabs for Unanswered vs Answered */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("belum_dijawab")}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "belum_dijawab"
                  ? "bg-white text-slate-800 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Belum Dijawab
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                unansweredQuestions.length > 0 ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-slate-200 text-slate-500"
              }`}>
                {unansweredQuestions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("sudah_dijawab")}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "sudah_dijawab"
                  ? "bg-white text-slate-800 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sudah Dijawab
              <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.2 rounded-full font-extrabold">
                {answeredQuestions.length}
              </span>
            </button>
          </div>
        </div>

        {/* List of Questions */}
        <div className="p-4 space-y-4 max-w-md mx-auto w-full">
          {msgSuccessStaff && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{msgSuccessStaff}</span>
            </div>
          )}

          {activeTab === "belum_dijawab" ? (
            unansweredQuestions.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="text-3xl">🎉</div>
                <h4 className="text-xs font-bold text-slate-700">Semua Pertanyaan Selesai!</h4>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                  Belum ada pertanyaan baru dari pasien dampingan Anda yang memerlukan jawaban.
                </p>
              </div>
            ) : (
              unansweredQuestions.map(q => (
                <div key={q.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-[10px] font-bold uppercase">
                        {q.pasienNama.substring(0, 2)}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{q.pasienNama}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">{q.tanggal}</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-xs text-slate-700 leading-relaxed font-medium italic">
                    "{q.pertanyaan}"
                  </div>

                  <form onSubmit={(e) => handleAnswerSubmit(e, q.id)} className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Tulis Jawaban Medis/Kader
                    </label>
                    <textarea
                      value={answerInputs[q.id] || ""}
                      onChange={(e) => setAnswerInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Masukkan penjelasan, panduan dosis, atau tips klinis penanganan keluhan pasien..."
                      rows={3}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Kirim Jawaban Resmi
                    </button>
                  </form>
                </div>
              ))
            )
          ) : (
            answeredQuestions.length === 0 ? (
              <div className="text-center py-16 text-slate-400 italic text-xs">
                Belum ada pertanyaan pasien yang dijawab sebelumnya.
              </div>
            ) : (
              answeredQuestions.map(q => (
                <div key={q.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-[10px] font-bold uppercase">
                        {q.pasienNama.substring(0, 2)}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{q.pasienNama}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">{q.tanggal}</span>
                  </div>

                  <div className="text-xs space-y-2">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pertanyaan Pasien:</span>
                      <p className="bg-slate-50 p-3 rounded-2xl text-slate-600 border border-slate-100 italic">
                        "{q.pertanyaan}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>Dijawab Oleh: {q.kaderAtauMedisNama}</span>
                        <span className="font-mono">{q.tanggalDijawab}</span>
                      </div>
                      <p className="p-3 bg-emerald-50/50 border border-emerald-100 text-slate-800 rounded-2xl leading-relaxed">
                        ✓ {q.jawaban}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    );
  }

  // Render for Patient
  const patientQuestions = questions.filter(q => q.pasienId === currentUser.id);

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      {/* Navigation tabs */}
      <div className="bg-white border-b border-slate-200/85 sticky top-0 z-10 p-3 flex gap-1">
        <button
          onClick={() => setActiveTab("tanya_kader")}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "tanya_kader"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Tanya Kader & Dokter
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "ai"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Bot className="w-4 h-4" /> Asisten AI
        </button>
        <button
          onClick={() => setActiveTab("faq")}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "faq"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <HelpCircle className="w-4 h-4" /> FAQ TB
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col max-w-md mx-auto w-full h-full justify-between space-y-4">
        {/* --- TAB 1: TANYA KADER/DOKTER (APLIKASI) --- */}
        {activeTab === "tanya_kader" && (
          <div className="space-y-4 flex-1">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" /> Sampaikan Pertanyaan / Keluhan
              </h3>

              {msgSuccessPatient && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-2xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{msgSuccessPatient}</span>
                </div>
              )}

              <form onSubmit={handleAddQuestionSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">
                    Tulis Pertanyaan Anda
                  </label>
                  <textarea
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Contoh: Bu, hari ini saya merasa mual hebat setelah minum OAT. Apakah boleh makan biskuit dulu sebelum minum obat berikutnya?"
                    rows={3}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                  <p className="text-[9px] text-slate-400 leading-normal">
                    * Pertanyaan Anda akan dienkripsi secara lokal sebelum diunggah agar privasi medis Anda tetap terlindungi sepenuhnya (HIPAA compliant).
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-blue-600/10 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-blue-100" />
                  Kirim Pertanyaan Terenkripsi
                </button>
              </form>
            </div>

            {/* Riwayat Pertanyaan Pasien */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Riwayat Pertanyaan Anda ({patientQuestions.length})
              </h4>

              {patientQuestions.length === 0 ? (
                <div className="text-center py-8 bg-white border border-slate-100 rounded-3xl text-slate-400 italic text-xs">
                  Belum ada pertanyaan yang Anda sampaikan.
                </div>
              ) : (
                patientQuestions.map(q => (
                  <div key={q.id} className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-xs space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pb-2 border-b border-slate-100/60">
                      <span>{q.tanggal}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 text-[8px] border ${
                        q.status === "Sudah Dijawab"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {q.status === "Sudah Dijawab" ? <CheckCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                        {q.status === "Sudah Dijawab" ? "Sudah Dijawab" : "Menunggu Kader"}
                      </span>
                    </div>

                    <div className="text-xs space-y-2">
                      <p className="text-slate-600 leading-normal italic">
                        "{q.pertanyaan}"
                      </p>

                      {q.status === "Sudah Dijawab" && q.jawaban && (
                        <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Tanggapan oleh {q.kaderAtauMedisNama} ({q.tanggalDijawab}):
                          </span>
                          <p className="p-3 bg-emerald-50/50 border border-emerald-100 text-slate-800 rounded-2xl leading-relaxed">
                            {q.jawaban}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: KONSULTASI GEMINI AI --- */}
        {activeTab === "ai" && (
          <div className="flex flex-col flex-1 min-h-[480px] bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="bg-slate-950 text-white px-4 py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[11px] font-bold text-slate-100 tracking-wide uppercase flex items-center gap-1">
                  Asisten Kecerdasan Buatan <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </span>
              </div>
              <div className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3" /> SSL Terenkripsi
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[320px] no-scrollbar">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 items-start ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className={`p-2 rounded-xl flex-shrink-0 ${
                    msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"
                  }`}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3.5 rounded-2xl max-w-[80%] text-xs leading-relaxed shadow-xs ${
                    msg.role === "user"
                      ? "bg-blue-50 text-blue-950 rounded-tr-none border border-blue-100 font-medium"
                      : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 items-start">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-800 flex-shrink-0 animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl rounded-tl-none border border-slate-100 max-w-[80%] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-200" />
                    <span className="text-[10px] text-slate-400 font-medium">Memikirkan jawaban...</span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {errorMessage}
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            <p className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-[9px] text-slate-400 text-center leading-normal">
              ⚠️ AI dirancang untuk kebutuhan edukasi. Konsultasikan ke Dokter Puskesmas untuk diagnosis atau pergantian resep obat Anda.
            </p>

            <form onSubmit={handleSendAi} className="p-3 border-t border-slate-100 bg-white flex gap-2">
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="Tanyakan efek samping, gizi, dll..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!aiMessage.trim() || isLoading}
                className={`rounded-xl p-3 flex items-center justify-center transition-all ${
                  aiMessage.trim() && !isLoading
                    ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-600/10"
                    : "bg-slate-100 text-slate-300"
                }`}
              >
                <SendHorizonal className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* --- TAB 3: FAQ KATA KUNCI EXPANDABLE --- */}
        {activeTab === "faq" && (
          <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar max-h-[480px]">
            {FAQ_DATABASE.map((faq) => {
              const isExpanded = expandedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                    className="w-full p-4 text-left flex justify-between items-center gap-3 hover:bg-slate-50"
                  >
                    <span className="text-xs font-bold text-slate-800 leading-normal">
                      {faq.pertanyaan}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="bg-slate-50 px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100/55">
                      {faq.jawaban}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
