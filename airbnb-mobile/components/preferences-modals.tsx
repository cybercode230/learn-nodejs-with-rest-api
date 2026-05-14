/**
 * Preferences Modals
 * Contains modals for Theme selection and Language selection with search.
 */
import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, TextInput, Switch } from 'react-native';
import { X, Search as SearchIcon, Check } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { LANGUAGES, Language } from '@/constants/languages';
import { ms } from 'react-native-size-matters';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
}

/**
 * Theme Selector Modal
 */
export function ThemeModal({ visible, onClose, theme, setTheme }: BaseModalProps & { theme: string, setTheme: (t: 'light' | 'dark' | 'system') => void }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-[40%]">
          <View className="p-6 flex-row items-center justify-between border-b border-[#F0F0F0]">
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={ms(24)} color="#222222" />
            </TouchableOpacity>
            <ThemedText className="text-[18px] font-figtree-bold">Appearance</ThemedText>
            <View className="w-8" />
          </View>
          
          <View className="p-6">
            <ThemeOption 
              label="Light mode" 
              active={theme === 'light'} 
              onPress={() => setTheme('light')} 
            />
            <ThemeOption 
              label="Dark mode" 
              active={theme === 'dark'} 
              onPress={() => setTheme('dark')} 
            />
            <ThemeOption 
              label="Use device settings" 
              active={theme === 'system'} 
              onPress={() => setTheme('system')} 
              description="Automatically switch between light and dark themes."
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ThemeOption({ label, active, onPress, description }: { label: string, active: boolean, onPress: () => void, description?: string }) {
  return (
    <TouchableOpacity 
      className="flex-row justify-between items-center py-4"
      onPress={onPress}
    >
      <View className="flex-1">
        <ThemedText className={`text-[16px] ${active ? 'font-figtree-bold' : 'font-figtree'}`}>{label}</ThemedText>
        {description && <ThemedText className="text-[13px] font-figtree text-[#717171] mt-1">{description}</ThemedText>}
      </View>
      <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${active ? 'border-[#222222] bg-[#222222]' : 'border-[#CCCCCC]'}`}>
        {active && <Check size={14} color="white" />}
      </View>
    </TouchableOpacity>
  );
}

/**
 * Language Selector Modal with Search
 */
export function LanguageModal({ visible, onClose, currentLanguage, onSelect }: BaseModalProps & { currentLanguage: string, onSelect: (code: string) => void }) {
  const [search, setSearch] = useState('');

  const filteredLanguages = useMemo(() => {
    if (!search) return LANGUAGES;
    const lowerSearch = search.toLowerCase();
    return LANGUAGES.filter(l => 
      l.name.toLowerCase().includes(lowerSearch) || 
      l.nativeName.toLowerCase().includes(lowerSearch) ||
      l.region.toLowerCase().includes(lowerSearch)
    );
  }, [search]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-[85%]">
          {/* Header */}
          <View className="p-6 flex-row items-center justify-between border-b border-[#F0F0F0]">
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={ms(24)} color="#222222" />
            </TouchableOpacity>
            <ThemedText className="text-[18px] font-figtree-bold">Select Language</ThemedText>
            <View className="w-8" />
          </View>

          {/* Search Bar */}
          <View className="px-6 py-4">
            <View className="flex-row items-center bg-[#F7F7F7] px-4 py-3 rounded-full border border-[#EBEBEB]">
              <SearchIcon size={20} color="#222222" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search languages or regions..."
                className="flex-1 ml-3 font-figtree text-[16px]"
                autoCorrect={false}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <X size={18} color="#717171" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* List */}
          <ScrollView className="flex-1 px-6">
            {filteredLanguages.map((lang) => (
              <TouchableOpacity 
                key={lang.code}
                className="flex-row justify-between items-center py-5 border-b border-[#F0F0F0]"
                onPress={() => {
                  onSelect(lang.code);
                  onClose();
                }}
              >
                <View>
                  <ThemedText className={`text-[16px] ${currentLanguage === lang.code ? 'font-figtree-bold' : 'font-figtree'}`}>
                    {lang.name}
                  </ThemedText>
                  <ThemedText className="text-[13px] font-figtree text-[#717171] mt-0.5">
                    {lang.nativeName} • {lang.region}
                  </ThemedText>
                </View>
                {currentLanguage === lang.code && (
                  <Check size={20} color="#222222" />
                )}
              </TouchableOpacity>
            ))}
            {filteredLanguages.length === 0 && (
              <View className="items-center py-20">
                <ThemedText className="text-[#717171] font-figtree">No languages found for "{search}"</ThemedText>
              </View>
            )}
            <View className="h-10" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
