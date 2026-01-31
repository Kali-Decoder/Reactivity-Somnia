"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ContractTemplate } from "@/app/config/contract_templates";

interface AddTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTemplate: (template: ContractTemplate) => void;
}

export function AddTemplateModal({ isOpen, onClose, onAddTemplate }: AddTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bytecode: "",
    abi: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.bytecode.trim()) {
      newErrors.bytecode = "Bytecode is required";
    } else if (!formData.bytecode.startsWith("0x")) {
      newErrors.bytecode = "Bytecode must start with 0x";
    }

    if (!formData.abi.trim()) {
      newErrors.abi = "ABI is required";
    } else {
      try {
        JSON.parse(formData.abi);
      } catch {
        newErrors.abi = "ABI must be valid JSON";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse ABI
      const parsedAbi = JSON.parse(formData.abi);

      // Create the new template
      const newTemplate: ContractTemplate = {
        id: formData.name.toLowerCase().replace(/\s+/g, "-"),
        name: formData.name,
        description: formData.description,
        category: "Custom",
        icon: "⚙️",
        abi: parsedAbi,
        bytecode: formData.bytecode,
        constructorParams: [],
      };

      // Add the template to the array via callback
      onAddTemplate(newTemplate);

      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        bytecode: "",
        abi: "",
      });
      setErrors({});
      onClose();

      // Show success message (you can integrate with your toast system)
      alert("Template added successfully!");
    } catch (error) {
      console.error("Error submitting template:", error);
      alert("Failed to submit template. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0A0A0F] border border-white/10 rounded-2xl shadow-2xl mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0A0F] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Add Custom Template</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white mb-2"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-white/5 border ${
                errors.name ? "border-red-500" : "border-white/10"
              } rounded-lg text-white placeholder-gray-500 outline-none focus:border-monad-purple/50 focus:ring-1 focus:ring-monad-purple/50 transition-all`}
              placeholder="e.g., ERC20 Token"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-white mb-2"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-2.5 bg-white/5 border ${
                errors.description ? "border-red-500" : "border-white/10"
              } rounded-lg text-white placeholder-gray-500 outline-none focus:border-monad-purple/50 focus:ring-1 focus:ring-monad-purple/50 transition-all resize-none`}
              placeholder="Describe your contract template..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Bytecode Field */}
          <div>
            <label
              htmlFor="bytecode"
              className="block text-sm font-medium text-white mb-2"
            >
              Bytecode <span className="text-red-500">*</span>
            </label>
            <textarea
              id="bytecode"
              name="bytecode"
              value={formData.bytecode}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2.5 bg-white/5 border ${
                errors.bytecode ? "border-red-500" : "border-white/10"
              } rounded-lg text-white placeholder-gray-500 outline-none focus:border-monad-purple/50 focus:ring-1 focus:ring-monad-purple/50 transition-all resize-none font-mono text-xs`}
              placeholder="0x608060405234801561001057600080fd5b50..."
            />
            {errors.bytecode && (
              <p className="text-red-500 text-sm mt-1">{errors.bytecode}</p>
            )}
          </div>

          {/* ABI Field */}
          <div>
            <label
              htmlFor="abi"
              className="block text-sm font-medium text-white mb-2"
            >
              ABI (JSON) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="abi"
              name="abi"
              value={formData.abi}
              onChange={handleChange}
              rows={6}
              className={`w-full px-4 py-2.5 bg-white/5 border ${
                errors.abi ? "border-red-500" : "border-white/10"
              } rounded-lg text-white placeholder-gray-500 outline-none focus:border-monad-purple/50 focus:ring-1 focus:ring-monad-purple/50 transition-all resize-none font-mono text-xs`}
              placeholder='[{"inputs":[],"name":"myFunction","outputs":[],"stateMutability":"nonpayable","type":"function"}]'
            />
            {errors.abi && (
              <p className="text-red-500 text-sm mt-1">{errors.abi}</p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-monad-purple hover:bg-monad-purple/90 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(135,109,255,0.5)]"
            >
              {isSubmitting ? "Submitting..." : "Submit Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

