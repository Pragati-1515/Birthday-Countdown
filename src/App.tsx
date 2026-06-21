import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Lock, Unlock, X, Sparkles, BookOpen,
  Calendar, ChevronRight, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---
interface DayData {
  id: number;
  date: string; // YYYY-MM-DD
  title: string;
  image: string;
  caption: string;
  messageFile: string;
}

// Fallback Daily Messages
const FALLBACK_MESSAGES: Record<number, string> = {
  1: "I still remember the first day we really started talking. It felt like finding a piece of myself that I didn't even know was missing. Every day since has been brighter, warmer, and so much more beautiful.",
  2: "You have this chaotic, lovely energy that completely sweeps me off my feet. Even when things are crazy, you find a way to make me laugh. I love every single silly face and random comment.",
  3: "There are moments when everything around us feels quiet, and it's just the soft warmth of your voice. Those are the moments I hold closest to my heart. Thank you for being my peace.",
  4: "If I could paint a picture of our future, it would be under a clear night sky, counting stars and sharing secrets we've never told anyone else. I'd choose you, under any sky, in any lifetime.",
  5: "I caught myself smiling today just thinking about how cute you look when you're excited about something. Your smile is literally my favorite thing in the entire world. Keep shining, my love.",
  6: "This memory has a permanent spot in my heart. Sometimes, when I need a little warmth, I play it back in my mind like a favorite movie. You made that day so incredibly special.",
  7: "A simple walk with you is better than any grand adventure. Just matching my steps to yours and listening to you talk about your day is my absolute favorite way to spend an afternoon.",
  8: "You are my favorite coffee date and my safest comfort. Just sitting in silence with you, drinking something warm, makes me feel like everything is going to be completely fine.",
  9: "Our late-night conversations are when we are our truest selves. I love hearing your dreams, your fears, and your random thoughts in the quiet hours of the night. I'm always here to listen.",
  10: "We are officially one-third of the way through our countdown! Every single day leading up to your birthday is a reminder of how lucky I am to have you in my life.",
  11: "Life isn't perfect, but our beautiful, messy moments are what make it real. I love you through the smooth days and the chaotic ones. You make even the mess feel like home.",
  12: "You are the literal sunshine in my life. Whenever things get gloomy, your laughter breaks through the clouds. I hope this note brings a little bit of that sunshine back to you.",
  13: "Holding your hand is a silent promise. It means I'm here, I'm not going anywhere, and we are in this together, step by step. I never want to let go.",
  14: "I love the way our dreams blend together when we talk about the future. Building a life and a world with you is the most exciting adventure I've ever imagined.",
  15: "On rainy, cozy days, all I want is to curl up next to you under a warm blanket, listening to the rain beat against the window. You are my human blanket.",
  16: "It's the little things you do—the sweet texts, the thoughtful gestures, the small check-ins—that build the foundation of my love for you. They mean the world to me.",
  17: "At the end of the day, when the noise fades away, my favorite place to be is right next to you. You are my safe harbor, my home, and my favorite person.",
  18: "Every song I listen to lately seems to have lyrics that remind me of you. You've become the sweet melody humming in the back of my mind all day long.",
  19: "I wish I could wrap you in the warmest hug right now. The kind of hug that makes all your worries and stress melt away. Consider this note a virtual wrap-around hug.",
  20: "I promise to always celebrate you, not just on your birthday, but every single day. You deserve to feel cherished, protected, and loved, always.",
  21: "I love watching the golden hour light catch your face. You look so ethereal, and in those moments, I am completely reminded of how magical you are.",
  22: "Your heart is so incredibly kind and generous. The way you care for people and bring light to those around you is inspiring. I want to love you better every day.",
  23: "Even your worst puns and silliest jokes make my day. Thank you for keeping my world lighthearted and full of laughter. You are my favorite comedian.",
  24: "Every day we spend together is a building block of our shared future. I look forward to all the tomorrows, knowing they are filled with you.",
  25: "When the world feels overwhelming, you are my ultimate comfort. Just knowing you exist and that you are in my corner makes me feel unstoppable.",
  26: "The days are flying by, and we are getting so close to your special day. Each morning is a little step closer to celebrating the day you were born.",
  27: "I whispered a sweet thought about you to the wind today, hoping it would carry it to your ear. I love you, more than words can express.",
  28: "Only a few days left! The excitement is building, and my heart is full of anticipation for your special day. You deserve the absolute best.",
  29: "One of my favorite things is just watching you be you. Your quirks, your passions, your quiet moments. I love every single version of you.",
  30: "It's the eve of the eve! The countdown is almost complete, and I can't wait for you to open the final surprise. You are so close, my love!",
  31: "Happy Birthday, My Love! Today, the entire universe is celebrating you, and my heart is completely yours. Thank you for bringing so much light and love into my world."
};

// Sticky Notes text
const STICKY_NOTES = [
  { text: "You crossed my mind today.", color: "bg-[#FFF9C4]", rotate: "-3deg" },
  { text: "This one made me smile.", color: "bg-[#F8C8DC]/60", rotate: "2deg" },
  { text: "I still remember this.", color: "bg-[#DCC6FF]/60", rotate: "-2deg" },
  { text: "How are you so cute?", color: "bg-[#E3F2FD]", rotate: "4deg" },
  { text: "My heart is yours.", color: "bg-[#FFF5F7]", rotate: "-4deg" }
];

export default function App() {
  // --- States ---
  const [days, setDays] = useState<DayData[]>([]);
  const [birthdayLetter, setBirthdayLetter] = useState<string>('');

  // Date Logic state (can be overridden by developer panel)
  const [simulatedDay, setSimulatedDay] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Modals & UI States
  const [activeDay, setActiveDay] = useState<DayData | null>(null);
  const [activeMessageText, setActiveMessageText] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState<boolean>(false);
  const [openedJarQuote, setOpenedJarQuote] = useState<string | null>(null);

  // Cinematic birthday state
  const [birthdayTriggered, setBirthdayTriggered] = useState<boolean>(false);
  const [birthdayStep, setBirthdayStep] = useState<number>(0);
  const [birthdayOpen, setBirthdayOpen] = useState<boolean>(false); // unlocks Grand Finale view
  const [birthdayTab, setBirthdayTab] = useState<'letter' | 'wall'>('letter');

  const getDaysRemainingText = () => {
    const totalSeconds = getBirthdayCountdownSeconds();
    const daysLeft = Math.ceil(totalSeconds / (3600 * 24));
    if (daysLeft <= 0) return "It's Your Special Day! ❤️";
    return `${daysLeft} Day${daysLeft > 1 ? 's' : ''} Until Your Special Day`;
  };

  // Target unlock times
  const START_DATE = new Date("2026-06-22T00:00:00");
  const BIRTHDAY_UNLOCK = new Date("2026-07-22T00:00:00");

  // --- Fetch Content Data ---
  useEffect(() => {
    // Fetch days.json
    fetch('/assets/data/days.json')
      .then(res => res.json())
      .then(data => setDays(data))
      .catch(err => {
        console.error("Failed to load days.json, fallback to mock data", err);
      });

    // Fetch birthday letter
    fetch('/assets/texts/birthday-letter.txt')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then(text => setBirthdayLetter(text))
      .catch(() => {
        setBirthdayLetter(`My Dearest,

Happy Birthday! 🎂✨

If you are reading this, it means the countdown has reached its end, and July 22nd has finally arrived. For the past month, we have taken a daily trip down memory lane, looking at little snapshots of our journey, reading small whispers from my heart, and sharing the laughs that make up our story. But today is different. Today is all about you.

I want you to know how deeply you are loved. Not just for the big, memorable moments, but for the quiet, ordinary days. I love you when you are laughing, when you are sleepily rubbing your eyes, when you are stressed and trying to handle everything, and when you are just being your beautiful, chaotic self. 

You make my life infinitely brighter just by existing in it. Every memory we've made so far is a treasure, and I cannot wait to create a million more with you.

Happy Birthday, my favorite person in the entire world. ❤️`);
      });
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Date Calculation Logic ---
  const getCurrentDate = (): Date => {
    if (simulatedDay !== null) {
      if (simulatedDay === 31) {
        // July 22 (Birthday)
        return new Date("2026-07-22T00:05:00");
      }
      // Calculate simulated date based on day number (Day 1 = June 22, Day 2 = June 23, etc.)
      const date = new Date(START_DATE.getTime());
      date.setDate(START_DATE.getDate() + (simulatedDay - 1));
      date.setHours(12, 0, 0); // mid-day
      return date;
    }
    return currentTime;
  };

  const getDayNumber = (targetDateStr: string): number => {
    const target = new Date(targetDateStr + "T00:00:00");
    const diffTime = target.getTime() - START_DATE.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  // Determine if a specific day is unlocked
  const isDayUnlocked = (day: DayData): boolean => {
    const now = getCurrentDate();
    const unlockDate = new Date(day.date + "T00:00:00");
    return now >= unlockDate;
  };

  // Determine if Birthday Finale is unlocked
  const isBirthdayUnlocked = (): boolean => {
    const now = getCurrentDate();
    return now >= BIRTHDAY_UNLOCK;
  };

  // Time remaining for locked days
  const getSecondsUntil = (targetDateStr: string): number => {
    const now = getCurrentDate();
    const target = new Date(targetDateStr + "T00:00:00");
    return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  };

  // Format countdown
  const formatCountdown = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds };
  };

  // Live countdown to Birthday July 22
  const getBirthdayCountdownSeconds = (): number => {
    const now = getCurrentDate();
    return Math.max(0, Math.floor((BIRTHDAY_UNLOCK.getTime() - now.getTime()) / 1000));
  };

  // --- Fetch Day Message Text ---
  const handleOpenDay = async (day: DayData) => {
    if (!isDayUnlocked(day)) return;
    setActiveDay(day);
    setLoadingMessage(true);
    try {
      const res = await fetch(`/assets/texts/${day.messageFile}`);
      if (res.ok) {
        const text = await res.text();
        // Check if Vite SPA returned index.html fallback (starts with <)
        if (text.trim().startsWith('<')) {
          setActiveMessageText(FALLBACK_MESSAGES[day.id] || "Sweet memory details...");
        } else {
          setActiveMessageText(text);
        }
      } else {
        // Fallback to local dictionary
        setActiveMessageText(FALLBACK_MESSAGES[day.id] || "Sweet memory details...");
      }
    } catch {
      setActiveMessageText(FALLBACK_MESSAGES[day.id] || "Sweet memory details...");
    } finally {
      setLoadingMessage(false);
    }
  };



  // --- Scroll to top when Birthday view is active ---
  useEffect(() => {
    if (birthdayOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [birthdayOpen]);

  // --- Birthday Midnight Sequence Trigger ---
  useEffect(() => {
    if (isBirthdayUnlocked() && !birthdayOpen && !birthdayTriggered) {
      triggerBirthdaySequence();
    }
  }, [simulatedDay, currentTime]);

  const triggerBirthdaySequence = () => {
    setBirthdayTriggered(true);
    setBirthdayStep(1);

    // Step 2: "Happy Birthday" (2s)
    setTimeout(() => {
      setBirthdayStep(2);
      // Trigger confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }, 3000);

    // Step 3: Message 1 (2.5s)
    setTimeout(() => {
      setBirthdayStep(3);
    }, 6000);

    // Step 4: Message 2 (2.5s)
    setTimeout(() => {
      setBirthdayStep(4);
    }, 9000);

    // Step 5: Unlock Finale Board
    setTimeout(() => {
      setBirthdayStep(5);
      setBirthdayOpen(true);
      // Continuous showers of confetti
      const interval = setInterval(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 2000);
      setTimeout(() => clearInterval(interval), 10000);
    }, 12000);
  };

  // --- Decorative Falling Petals & Floating Hearts ---
  const petals = Array.from({ length: 35 });
  const hearts = Array.from({ length: 25 });

  return (
    <div className="relative min-h-screen bg-themeBg text-themeText font-sans overflow-hidden">

      {/* Falling Hearts Rain */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {hearts.map((_, i) => (
          <div
            key={`heart-${i}`}
            className="absolute text-themeRose/30 animate-heart-fall"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10vh`,
              fontSize: `${12 + Math.random() * 20}px`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${8 + Math.random() * 10}s`,
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      {/* Falling Petals Rain */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {petals.map((_, i) => (
          <div
            key={`petal-${i}`}
            className="absolute text-[#FFC0CB]/50 animate-petal-fall"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10vh`,
              fontSize: `${14 + Math.random() * 18}px`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${12 + Math.random() * 10}s`,
            }}
          >
            🌸
          </div>
        ))}
      </div>

      {/* Sparkles Floating */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-70" />

      {/* Developer Simulator Panel Removed for Production */}



      {/* CINEMATIC MIDNIGHT SEQUENCE COVER */}
      <AnimatePresence>
        {birthdayTriggered && birthdayStep < 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1e131d] z-50 flex flex-col items-center justify-center text-white px-6 text-center"
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={`confetti-${i}`}
                  className="absolute text-pink-300 animate-float-slow"
                  style={{
                    left: `${Math.random() * 100}%`,
                    bottom: `-${10 + Math.random() * 20}%`,
                    fontSize: `${10 + Math.random() * 20}px`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${8 + Math.random() * 6}s`,
                  }}
                >
                  ❤️
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {birthdayStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.1, opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="space-y-4"
                >
                  <Heart className="w-20 h-20 text-themeRose mx-auto animate-beat fill-themeRose filter drop-shadow-[0_0_15px_rgba(255,158,181,0.8)]" />
                  <h1 className="text-4xl md:text-6xl font-handwritten font-bold text-themePink">
                    Happy Birthday ❤️
                  </h1>
                </motion.div>
              )}

              {birthdayStep === 3 && (
                <motion.p
                  key="step3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 1 }}
                  className="text-2xl md:text-4xl font-light tracking-wide max-w-2xl font-sans text-pink-100"
                >
                  "This journey was never about counting days."
                </motion.p>
              )}

              {birthdayStep === 4 && (
                <motion.p
                  key="step4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 1 }}
                  className="text-2xl md:text-4xl font-light tracking-wide max-w-2xl font-sans text-pink-100"
                >
                  "...It was about celebrating you."
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {birthdayOpen ? (
        // --- BIRTHDAY FINALE EXPERIENCES ---
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-5xl mx-auto px-6 py-12 relative z-10 space-y-10"
        >
          {/* Birthday Header */}
          <header className="text-center pt-8">
            <Heart className="w-16 h-16 text-themeRose fill-themeRose mx-auto mb-4 animate-pulse animate-beat" />
            <h1 className="text-4xl md:text-5xl font-bold font-sans bg-gradient-to-r from-themeRose via-purple-500 to-themeRose bg-clip-text text-transparent drop-shadow-sm">
              Happy Birthday, My Angel! ❤️
            </h1>
            <p className="text-sm text-themeText/70 mt-2 font-light">
              Our journey is complete. Open the tabs below to read your letter and browse our scrapbook memories.
            </p>
          </header>

          {/* Top Navigation Bar */}
          <div className="flex justify-center border-b border-themePink/20 pb-4">
            <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-themePink/30 gap-1.5 shadow-sm">
              <button
                onClick={() => setBirthdayTab('wall')}
                className={`px-5 py-2.5 rounded-full font-medium text-xs flex items-center gap-1.5 transition-all duration-300 ${
                  birthdayTab === 'wall' 
                    ? 'bg-themeRose text-white shadow-md scale-105' 
                    : 'text-themeText/75 hover:bg-themePink/10 hover:text-themeRose'
                }`}
              >
                <Sparkles className="w-4 h-4" /> Memory Wall
              </button>
              <button
                onClick={() => setBirthdayTab('letter')}
                className={`px-5 py-2.5 rounded-full font-medium text-xs flex items-center gap-1.5 transition-all duration-300 ${
                  birthdayTab === 'letter' 
                    ? 'bg-themeRose text-white shadow-md scale-105' 
                    : 'text-themeText/75 hover:bg-themePink/10 hover:text-themeRose'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Read a Letter
              </button>
            </div>
          </div>

          {/* Active Tab Content */}
          <div className="py-6">
            <AnimatePresence mode="wait">
              {birthdayTab === 'wall' && (
                <motion.section 
                  key="wall"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold font-sans text-themeText">📌 Polaroid Memory Wall</h2>
                    <p className="text-xs text-themeText/70 mt-1">Tap a card to straighten and open its detail log.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center max-w-6xl mx-auto px-4">
                    {days.map((day, idx) => {
                      const rotValues = ["-4deg", "3deg", "-2deg", "5deg", "-5deg", "2deg"];
                      const rotation = rotValues[idx % rotValues.length];

                      return (
                        <motion.div
                          key={`polaroid-${day.id}`}
                          whileHover={{ scale: 1.05, rotate: "0deg", zIndex: 10 }}
                          style={{ rotate: rotation }}
                          className="bg-white p-4 pb-8 rounded-sm polaroid-card border border-gray-200/60 relative transition-shadow duration-300 hover:shadow-xl shadow-md cursor-pointer max-w-[280px] mx-auto w-full"
                          onClick={() => handleOpenDay(day)}
                        >
                          <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-6 z-20 ${idx % 2 === 0 ? 'washi-tape' : 'washi-tape-lavender'}`} />

                          <div className="aspect-square bg-gray-50 border border-gray-200/50 rounded-sm overflow-hidden flex items-center justify-center relative shadow-inner">
                            <ImageWithFallback 
                              src={`/assets/images/${day.image}`}
                              alt={day.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="mt-4 text-center">
                            <p className="font-handwritten text-lg font-bold text-[#4A3B32] leading-snug px-1 line-clamp-2">
                              {day.caption}
                            </p>
                            <p className="text-xs font-semibold tracking-wider text-themeText/50 uppercase mt-2">Day {day.id}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {birthdayTab === 'letter' && (
                <motion.section 
                  key="letter"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  id="birthday-letter" 
                  className="paper-texture lined-paper border border-[#e8d3d3] rounded-3xl p-8 md:p-12 shadow-2xl relative max-w-3xl mx-auto"
                >
                  <div className="absolute top-[-10px] left-8 washi-tape px-6 py-1 text-xs text-transparent">TAPE</div>
                  <div className="absolute top-[-5px] right-8 washi-tape-lavender px-6 py-1 text-xs text-transparent">TAPE</div>
                  
                  <h2 className="text-3xl font-handwritten font-bold mb-8 text-center text-themeText">🎁 Your Birthday Letter</h2>
                  <div className="whitespace-pre-wrap font-handwritten text-xl md:text-2xl text-themeText leading-relaxed max-w-2xl mx-auto">
                    {birthdayLetter}
                  </div>
                  <div className="mt-8 text-center">
                    <Heart className="w-8 h-8 text-themeRose fill-themeRose mx-auto animate-pulse" />
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : (
        // --- COUNTDOWN / TIMELINE VIEW ---
        <>
          {/* Hero Section */}
          <header className="max-w-6xl mx-auto px-6 pt-16 pb-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-themePink/40 text-themeRose font-medium text-sm mb-6 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-themeRose animate-pulse" />
              <span>Our Romantic Scrapbook Diary</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4 font-sans"
            >
              <span>{getDaysRemainingText()}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-lg md:text-xl text-themeText/80 max-w-2xl mx-auto font-light mb-8"
            >
              Every day holds a little piece of my heart. Unlocking memories day by day.
            </motion.p>

            {/* Live Countdown Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="max-w-md mx-auto bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-md border border-themePink/30 mb-8"
            >
              <h2 className="text-xs font-semibold uppercase tracking-widest text-themeRose/80 mb-3 flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> 22 July Birthday Countdown
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(formatCountdown(getBirthdayCountdownSeconds())).map(([label, val]) => (
                  <div key={label} className="bg-white/90 rounded-2xl p-3 border border-themePink/10">
                    <div className="text-2xl md:text-3xl font-bold font-sans text-themeText">{val}</div>
                    <div className="text-[10px] uppercase font-semibold tracking-wider text-themeText/50">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero CTA */}
            <div className="flex justify-center gap-4">
              <a
                href="#timeline"
                className="px-8 py-3.5 rounded-full bg-themeRose text-white font-medium shadow-lg hover:bg-themeRose/90 hover:scale-105 active:scale-95 transition duration-300 flex items-center gap-2 group border border-themeRose/20"
              >
                Open Today's Memory
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </header>

          {/* FINALE SURPRISE UNLOCK / COUNTDOWN CARD */}
          <section className="max-w-4xl mx-auto px-6 py-8 relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-themePink/30 via-themeLavender/30 to-themePink/30 border border-themePink/40 rounded-3xl p-8 text-center shadow-lg relative overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/30 rounded-full blur-xl" />
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-themeLavender/40 rounded-full blur-xl" />

              {isBirthdayUnlocked() ? (
                // --- July 22 UNLOCKED card ---
                <>
                  <Unlock className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-bounce glow-lavender" />
                  <h3 className="text-2xl font-bold text-themeText mb-2">Your Final Surprise Is Ready! 🎁</h3>
                  <p className="text-sm text-themeText/70 max-w-md mx-auto mb-6">
                    Your countdown is complete. Click below to open your personal handwritten birthday letter and the grand memories gallery.
                  </p>
                  <button
                    onClick={triggerBirthdaySequence}
                    className="px-8 py-3.5 rounded-full bg-purple-500 hover:bg-purple-600 text-white font-semibold text-sm shadow-lg hover:scale-105 active:scale-95 transition duration-300 flex items-center gap-2 mx-auto border border-purple-500/20"
                  >
                    Open Your Final Surprise
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </button>
                </>
              ) : (
                // --- Before July 22 LOCKED card ---
                <>
                  <Lock className="w-12 h-12 text-themeRose mx-auto mb-4 animate-bounce glow-subtle" />
                  <h3 className="text-2xl font-bold text-themeText mb-2">Your Final Surprise Is Waiting</h3>
                  <p className="text-sm text-themeText/70 max-w-md mx-auto mb-6">
                    The grand finale contains a personal handwritten birthday letter and a grand memory archive gallery. It opens exactly on July 22 at midnight.
                  </p>
                  <div className="inline-block bg-white/80 border border-themePink/20 px-6 py-3 rounded-2xl shadow-sm text-sm font-semibold text-themeRose">
                    🔒 Unlocks on July 22, 12:00:00 AM
                  </div>
                </>
              )}
            </motion.div>
          </section>

          {/* Daily Timeline Section */}
          <section id="timeline" className="max-w-5xl mx-auto px-6 py-12 relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold font-sans text-themeText mb-2">Daily Memory Timeline</h2>
              <p className="text-sm text-themeText/70">A nostalgic journey unfolding day by day from June 22 to July 22</p>
            </div>

            {days.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white/50 border border-dashed border-themePink rounded-3xl">
                <AlertCircle className="w-8 h-8 text-themeRose mb-2 animate-spin" />
                <p className="text-sm font-medium">Loading timeline contents...</p>
                <p className="text-xs text-gray-500 mt-1">Make sure days.json is placed in public/assets/data/days.json</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-themePink/30 ml-4 md:ml-32 pl-6 md:pl-12 space-y-12">
                {days.map((day, index) => {
                  const unlocked = isDayUnlocked(day);
                  const isToday = simulatedDay !== null
                    ? simulatedDay === day.id
                    : new Date().toDateString() === new Date(day.date + "T00:00:00").toDateString();

                  const dayNum = day.id;

                  return (
                    <div key={day.id} className="relative group">

                      {/* Timeline Dot Indicator */}
                      <div className={`absolute left-[-31px] md:left-[-55px] top-1.5 w-5 h-5 rounded-full border-4 flex items-center justify-center transition ${unlocked
                          ? isToday
                            ? 'bg-themeRose border-white scale-125 shadow-md ring-4 ring-themePink/30'
                            : 'bg-white border-themeRose'
                          : 'bg-gray-300 border-gray-400'
                        }`}>
                        {unlocked ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-themeRose" />
                        ) : (
                          <Lock className="w-2.5 h-2.5 text-gray-500" />
                        )}
                      </div>

                      {/* Left-side Day Label for Desktop */}
                      <div className="absolute left-[-160px] top-0.5 hidden md:block text-right w-28">
                        <span className="text-xs font-bold uppercase tracking-wider text-themeText/50">Day {dayNum}</span>
                        <div className="text-sm font-semibold text-themeText">{new Date(day.date + "T00:00:00").toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                      </div>

                      {/* Memory Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        onClick={() => unlocked && handleOpenDay(day)}
                        className={`relative p-5 rounded-3xl transition duration-300 select-none ${unlocked
                            ? 'bg-white border border-themePink/30 hover:border-themeRose shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-1'
                            : 'bg-white/40 border border-gray-200/50 backdrop-blur-[2px] filter blur-[0.6px]'
                          } ${isToday ? 'ring-2 ring-themeRose/60 bg-gradient-to-br from-white to-themePink/5' : ''}`}
                      >

                        {/* Mobile Date Header */}
                        <div className="md:hidden flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-themeRose">Day {dayNum}</span>
                          <span className="text-xs text-gray-500 font-medium">
                            {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {unlocked ? (
                          <div className="flex flex-col sm:flex-row gap-4 items-center">
                            {/* Mini image preview / camera fallback */}
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-themePink/20 flex-shrink-0 flex items-center justify-center border border-themePink/30 relative">
                              <ImageWithFallback
                                src={`/assets/images/${day.image}`}
                                alt={day.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-themeRose font-semibold text-sm">
                                <Unlock className="w-3.5 h-3.5" />
                                Unlocks Day {dayNum} {isToday && <span className="bg-themeRose text-white text-[9px] px-1.5 py-0.5 rounded-full ml-1">Active Today</span>}
                              </div>
                              <h4 className="text-lg font-bold text-themeText mt-0.5 leading-snug">{day.title}</h4>
                              <p className="text-xs text-themeText/75 mt-1 font-handwritten text-md italic">"{day.caption}"</p>
                            </div>
                            <div className="text-xs text-themeRose font-semibold border border-themePink/40 bg-themePink/10 px-3 py-1 rounded-full hover:bg-themeRose hover:text-white transition flex items-center gap-1">
                              Open Memory <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ) : (
                          <div className="py-4 text-center sm:text-left flex flex-col sm:flex-row items-center gap-4 justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
                                <Lock className="w-5 h-5 text-gray-400" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-600">Locked Day {dayNum}</h4>
                                <p className="text-xs text-gray-500">Unlocks on {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p>
                              </div>
                            </div>

                            {/* Live Remaining Time */}
                            <div className="text-xs font-semibold text-gray-500 bg-gray-100/60 border border-gray-200 px-3 py-1 rounded-full">
                              {(() => {
                                const secs = getSecondsUntil(day.date);
                                if (secs > 0) {
                                  const cd = formatCountdown(secs);
                                  if (cd.days > 0) {
                                    return `Opens in ${cd.days} day${cd.days > 1 ? 's' : ''}`;
                                  }
                                  return `Opens in ${cd.hours}h ${cd.minutes}m`;
                                }
                                return "Opening shortly...";
                              })()}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* --- STICKY NOTES SECTION --- */}
          <section className="max-w-3xl mx-auto px-6 py-12 relative z-10">
            {/* Sticky Notes Corkboard */}
            <div className="bg-[#FFFDF9] border border-[#e8d3d3] rounded-3xl p-8 shadow-inner min-h-[350px] relative">
              <div className="absolute -top-3 left-6 washi-tape px-6 py-1 text-xs text-transparent">TAPE</div>

              <h3 className="text-xl font-bold font-sans text-themeText mb-6 flex items-center gap-1.5">
                📌 Daily Sticky Notes
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {STICKY_NOTES.map((note, index) => (
                  <motion.div
                    key={`sticky-${index}`}
                    style={{ rotate: note.rotate }}
                    onClick={() => setOpenedJarQuote(note.text)}
                    className={`p-4 rounded-lg sticky-note border border-gray-200/30 ${note.color} aspect-video flex items-center justify-center cursor-pointer`}
                  >
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-400/80 shadow-sm" />
                    <p className="font-handwritten text-lg text-themeText text-center leading-snug">
                      {note.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* FOOTER */}
      <footer className="py-12 text-center text-xs text-themeText/50 border-t border-themePink/10 mt-16 bg-white/20 relative z-10">
        <p className="flex items-center justify-center gap-1 text-sm font-medium text-themeRose/80 mb-2">
          Made with a million hearts ❤️
        </p>
        <p>© 30 Days Until Your Birthday Countdown • Scrapbook Edition</p>
      </footer>

      {/* --- MEMORY CARD DETAIL MODAL --- */}
      <AnimatePresence>
        {activeDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 md:p-10 max-w-4xl w-full shadow-2xl relative border border-themePink/20 flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setActiveDay(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-themeText transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Polaroid Frame image */}
              <div className="w-full md:w-[45%] flex-shrink-0">
                <div className="bg-white p-4 pb-10 rounded-sm polaroid-card border border-gray-100 shadow-lg relative rotate-[-2deg] max-w-sm mx-auto">
                  <div className="aspect-square bg-gray-50 border border-gray-200/50 rounded-sm overflow-hidden flex items-center justify-center relative">
                    <ImageWithFallback
                      src={`/assets/images/${activeDay.image}`}
                      alt={activeDay.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="font-handwritten text-xl text-themeText italic leading-snug">
                      "{activeDay.caption}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Memory Details */}
              <div className="flex-1 flex flex-col justify-between pt-2">
                <div>
                  <div className="flex items-center justify-between text-sm text-themeRose font-semibold mb-2">
                    <span className="bg-themePink/20 px-2 py-0.5 rounded-full uppercase">Day {activeDay.id}</span>
                    <span>{new Date(activeDay.date + "T00:00:00").toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold font-sans text-themeText mb-4 leading-tight">{activeDay.title}</h3>

                  <div className="border-t border-themePink/20 pt-4 font-sans text-base md:text-lg text-themeText/80 leading-relaxed max-h-[380px] overflow-y-auto pr-1">
                    {loadingMessage ? (
                      <div className="flex items-center gap-2 py-4 text-gray-400">
                        <div className="w-4 h-4 border-2 border-themeRose border-t-transparent rounded-full animate-spin" />
                        Unfolding secret letter...
                      </div>
                    ) : (
                      <p className="whitespace-pre-line bg-themeBg/50 p-5 rounded-2xl border border-themePink/10">{activeMessageText}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setActiveDay(null)}
                    className="px-8 py-3 rounded-full bg-themeRose hover:bg-themeRose/90 text-white font-bold text-sm shadow-md transition"
                  >
                    Close Memory
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- SWEET QUOTES / STICKY NOTES DETAILED POPUP MODAL --- */}
      <AnimatePresence>
        {openedJarQuote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-[#FFFDF9] rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border-2 border-[#e8d3d3] relative paper-texture max-h-[85vh] overflow-y-auto"
            >
              <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 washi-tape px-8 py-1.5 text-xs text-transparent">TAPE</div>

              <button
                onClick={() => setOpenedJarQuote(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-themeText transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="py-6">
                <Heart className="w-12 h-12 text-themeRose fill-themeRose/20 mx-auto mb-4 animate-pulse" />
                <p className="font-handwritten text-2xl md:text-3xl text-themeText leading-relaxed px-2">
                  {openedJarQuote}
                </p>
              </div>

              <button
                onClick={() => setOpenedJarQuote(null)}
                className="px-6 py-2 rounded-full bg-themeRose hover:bg-themeRose/90 text-white font-semibold text-xs shadow-sm transition"
              >
                Put it Back
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- Image Component with Graceful SVG Fallback ---
interface FallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

function ImageWithFallback({ src, alt, ...props }: FallbackProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-themePink/30 via-themeLavender/20 to-white flex flex-col items-center justify-center text-center p-3">
        <Heart className="w-8 h-8 text-themeRose/60 animate-pulse fill-themeRose/10" />
        <span className="text-[11px] font-handwritten text-themeText/70 mt-2 font-bold leading-tight">Sweet Memory</span>
        <span className="text-[9px] text-themeText/50 mt-0.5">Upload image to folder!</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  );
}
