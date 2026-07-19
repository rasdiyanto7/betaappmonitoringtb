/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { EDU_TB_SUBMENUS, MITOS_FAKTA_TB, KELUARGA_GUIDELINES } from "../data/eduData";
import { Info, BookOpen, CheckCircle, ShieldAlert, AlertTriangle, Apple, Home, HelpCircle, Heart, Users, MessageSquare } from "lucide-react";

export default function EduTB() {
  const [activeTab, setActiveTab] = useState<"tb" | "mitos">("tb");
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>("apa-itu-tb");
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: boolean | null }>({});
  const [quizReveal, setQuizReveal] = useState<{ [key: number]: boolean }>({});

  const handleQuizAnswer = (index: number, answer: boolean) => {
    setQuizAnswers({ ...quizAnswers, [index]: answer });
    setQuizReveal({ ...quizReveal, [index]: true });
  };

  const getSubMenuIcon = (iconName: string) => {
    switch (iconName) {
      case "Info": return <Info className="w-5 h-5 text-emerald-600" />;
      case "Users": return <Users className="w-5 h-5 text-emerald-600" />;
      case "Activity": return <HelpCircle className="w-5 h-5 text-emerald-600" />;
      case "Clock": return <BookOpen className="w-5 h-5 text-emerald-600" />;
      case "AlertTriangle": return <AlertTriangle className="w-5 h-5 text-emerald-600" />;
      case "ShieldAlert": return <ShieldAlert className="w-5 h-5 text-emerald-600" />;
      case "Home": return <Home className="w-5 h-5 text-emerald-600" />;
      case "Apple": return <Apple className="w-5 h-5 text-emerald-600" />;
      default: return <BookOpen className="w-5 h-5 text-emerald-600" />;
    }
  };

  const currentSubMenu = EDU_TB_SUBMENUS.find(item => item.id === selectedSubMenu) || EDU_TB_SUBMENUS[0];

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      {/* Tab Navigation header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 p-3 flex gap-2">
        <button
          onClick={() => setActiveTab("tb")}
          className={`flex-1 py-2.5 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "tb"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-4 h-4" /> Edukasi Apa itu TB?
        </button>
        <button
          onClick={() => setActiveTab("mitos")}
          className={`flex-1 py-2.5 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "mitos"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Mitos & Fakta TB
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        {/* --- TAB 1: APA ITU TB --- */}
        {activeTab === "tb" && (
          <div className="space-y-4">
            {/* Horizontal sub-menu buttons selector */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
              {EDU_TB_SUBMENUS.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => setSelectedSubMenu(menu.id)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs font-medium border transition-all ${
                    selectedSubMenu === menu.id
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                      : "bg-white border-slate-100 text-slate-600 shadow-xs"
                  }`}
                >
                  {menu.title.split("(")[0].replace("?", "")}
                </button>
              ))}
            </div>

            {/* Submenu Content Display */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="bg-emerald-50 p-2.5 rounded-xl">
                  {getSubMenuIcon(currentSubMenu.icon)}
                </div>
                <h2 className="font-display font-bold text-slate-800 text-base leading-tight">
                  {currentSubMenu.title}
                </h2>
              </div>

              <div className="space-y-3">
                {currentSubMenu.content.map((p, idx) => (
                  <p key={idx} className="text-xs text-slate-600 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              {currentSubMenu.points && (
                <div className="bg-slate-50 rounded-xl p-4 mt-3 space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Poin Penting:
                  </h3>
                  <ul className="space-y-2">
                    {currentSubMenu.points.map((pt, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex gap-2 items-start">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: MITOS VS FAKTA --- */}
        {activeTab === "mitos" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed">
              <strong>Edukasi Interaktif:</strong> Banyak asumsi salah di masyarakat yang membuat penanganan penyakit TB terlambat atau memicu stigma negatif. Ketuk tombol untuk menebak mana <strong>MITOS</strong> dan mana <strong>FAKTA</strong>!
            </div>

            <div className="space-y-4">
              {MITOS_FAKTA_TB.map((quiz, idx) => {
                const isSelected = quizAnswers[idx] !== undefined;
                const isCorrect = isSelected && (
                  (quizAnswers[idx] === true && quiz.tipe === "FAKTA") ||
                  (quizAnswers[idx] === false && quiz.tipe === "MITOS")
                );

                return (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
                    <div className="flex gap-2 items-start">
                      <span className="font-mono text-xs text-slate-400 mt-0.5">Q{idx + 1}.</span>
                      <p className="text-xs font-bold text-slate-800 leading-normal">
                        "{quiz.pernyataan}"
                      </p>
                    </div>

                    {/* True / False Buttons */}
                    {!quizReveal[idx] ? (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleQuizAnswer(idx, false)}
                          className="py-2 bg-slate-50 hover:bg-red-50 hover:text-red-700 text-xs text-slate-600 font-semibold rounded-xl border border-slate-200 transition-all"
                        >
                          ❌ MITOS
                        </button>
                        <button
                          onClick={() => handleQuizAnswer(idx, true)}
                          className="py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-xs text-slate-600 font-semibold rounded-xl border border-slate-200 transition-all"
                        >
                          ✅ FAKTA
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase text-white ${
                            quiz.tipe === "FAKTA" ? "bg-emerald-500" : "bg-red-500"
                          }`}>
                            Jawaban: {quiz.tipe}
                          </span>
                          <span className={isCorrect ? "text-emerald-600" : "text-rose-600"}>
                            {isCorrect ? "🎉 Tebakan Anda BENAR!" : "😢 Tebakan Anda kurang tepat"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl leading-relaxed">
                          {quiz.penjelasan}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
