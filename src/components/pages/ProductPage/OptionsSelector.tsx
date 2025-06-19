import { Button } from "@/components/ui/button";
import { OptionGroupDisplay } from "@/types/product";
import { motion } from "framer-motion";

interface OptionsSelectorProps {
  availableOptions: OptionGroupDisplay[];
  selectedOptions: { [groupName: string]: string };
  onSelectOption: (groupName: string, optionId: string) => void;
  disabled: boolean;
}

export default function OptionsSelector({
  availableOptions,
  selectedOptions,
  onSelectOption,
  disabled,
}: OptionsSelectorProps) {
  return (
    <>
      {availableOptions.map((group, groupIndex) => (
        <motion.div
          key={group.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 + groupIndex * 0.1 }}
          className="space-y-3"
        >
          <div>
            <label
              htmlFor={group.name}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {group.name}
            </label>
            <div className="flex flex-wrap gap-2">
              {group.values.map((option, index) => {
                const isSelected = selectedOptions[group.name] === option.id;
                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: 0.7 + groupIndex * 0.1 + index * 0.03,
                    }}
                  >
                    <Button
                      variant={isSelected ? "orange" : "outline"}
                      onClick={() => onSelectOption(group.name, option.id)}
                      disabled={disabled}
                    >
                      {option.value}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}