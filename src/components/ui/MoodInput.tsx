// src/components/ui/MoodInput.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

interface MoodInputProps {
  onTextSubmit: (text: string) => void;
}

const MoodInput: React.FC<MoodInputProps> = ({ onTextSubmit }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onTextSubmit(input);
      setInput("");
    }
  };

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
    >
      <h3 className="text-xl font-semibold text-white mb-4">
        How are you feeling?
      </h3>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        autoComplete="off"
        role="form"
        aria-label="Mood input form"
      >
        <label htmlFor="mood-textarea" className="sr-only">
          Describe your mood
        </label>
        <textarea
          id="mood-textarea"
          name="mood-text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your mood... (e.g., I feel creative and happy!)"
          className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-purple-200 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-required="true"
          autoComplete="off"
          role="textbox"
          aria-multiline="true"
          aria-label="Mood description text area"
          data-lpignore="true" // Disable LastPass
          data-form-type="other" // Signal this is not a login form
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          aria-label="Analyze mood and create artwork"
        >
          <Send size={20} />
          Analyze & Create
        </motion.button>
      </form>

      {/* Quick mood examples */}
      <div className="mt-6 space-y-2">
        <p className="text-purple-200 text-sm">Try these:</p>
        <div className="flex flex-wrap gap-2">
          {["I feel creative!", "A bit sad...", "So energized!"].map(
            (example, index) => (
              <motion.button
                key={example}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTextSubmit(example)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1 text-sm text-purple-200 transition-colors"
                aria-label={`Try example: ${example}`}
                type="button"
              >
                {example}
              </motion.button>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MoodInput;
