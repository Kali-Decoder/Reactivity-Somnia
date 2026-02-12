"use client";

import { ContractTemplate } from "@/app/config/contract_templates";
import { FileCode, Check } from "lucide-react";

interface DraggableTemplateProps {
  template: ContractTemplate;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export function DraggableTemplate({ template, isSelected, isDisabled, onClick }: DraggableTemplateProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`group w-full text-left rounded-xl border p-6 backdrop-blur-sm transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
        isSelected 
          ? 'border-monad-purple bg-monad-purple/20 shadow-[0_0_20px_-5px_rgba(135,109,255,0.5)]' 
          : 'border-white/10 bg-white/5 hover:border-monad-purple/50 hover:bg-white/10'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{template.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileCode className="h-4 w-4 text-monad-purple" />
            <h3 className="text-lg font-semibold text-white">{template.name}</h3>
            {isSelected && (
              <div className="ml-auto">
                <div className="h-6 w-6 rounded-full bg-monad-purple flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-3">{template.description}</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-md bg-monad-purple/10 text-monad-purple text-xs font-medium">
              {template.category}
            </span>
            <span className="text-xs text-gray-500">
              {template.constructorParams?.length || 0} params
            </span>
          </div>
        </div>
      </div>
      <div className={`mt-4 text-xs transition-opacity ${
        isSelected 
          ? 'text-monad-purple opacity-100' 
          : 'text-gray-500 opacity-0 group-hover:opacity-100'
      }`}>
        {isSelected ? '✓ Selected' : '👆 Click to select'}
      </div>
    </button>
  );
}

