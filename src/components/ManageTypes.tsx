import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert, Platform } from 'react-native';
import { Settings, Plus, Pencil, Trash2, X, ChevronRight } from 'lucide-react-native';
import { cn } from '../lib/utils';
import { useI18n } from '../i18n/I18nContext';
import { ExpenseType, ExpenseSubType } from '../db/schema';

// Android-safe font that supports Bangla/Bengali script
const fontFamily = Platform.OS === 'android' ? 'sans-serif' : undefined;

interface ManageTypesProps {
  expenseTypes: ExpenseType[];
  expenseSubTypes: ExpenseSubType[];
  onAdd: (nameEn: string, nameBn: string) => void;
  onUpdate: (id: number, nameEn: string, nameBn: string) => void;
  onDelete: (id: number) => void;
  onAddSubType: (expenseTypeId: number, nameEn: string, nameBn: string) => void;
  onUpdateSubType: (id: number, nameEn: string, nameBn: string) => void;
  onDeleteSubType: (id: number) => void;
  renderTrigger?: (onPress: () => void) => React.ReactNode;
}

export function ManageTypes({
  expenseTypes,
  expenseSubTypes,
  onAdd,
  onUpdate,
  onDelete,
  onAddSubType,
  onUpdateSubType,
  onDeleteSubType,
  renderTrigger,
}: ManageTypesProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<ExpenseType | null>(null);
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');

  // Sub-type management state
  const [isSubTypeListOpen, setIsSubTypeListOpen] = useState(false);
  const [selectedParentType, setSelectedParentType] = useState<ExpenseType | null>(null);
  const [isSubTypeFormOpen, setIsSubTypeFormOpen] = useState(false);
  const [editingSubType, setEditingSubType] = useState<ExpenseSubType | null>(null);
  const [subNameEn, setSubNameEn] = useState('');
  const [subNameBn, setSubNameBn] = useState('');

  // ─── Type Handlers ───────────────────────────────────────────────

  const handleOpenAdd = () => {
    setEditingType(null);
    setNameEn('');
    setNameBn('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (et: ExpenseType) => {
    setEditingType(et);
    setNameEn(et.name_en);
    setNameBn(et.name_bn);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!nameEn.trim() || !nameBn.trim()) return;

    if (editingType) {
      onUpdate(editingType.id, nameEn.trim(), nameBn.trim());
    } else {
      onAdd(nameEn.trim(), nameBn.trim());
    }
    setIsFormOpen(false);
    setNameEn('');
    setNameBn('');
    setEditingType(null);
  };

  const handleDelete = (et: ExpenseType) => {
    Alert.alert(
      t('deleteTypeConfirmTitle'),
      t('deleteTypeConfirmMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => onDelete(et.id) },
      ],
    );
  };

  // ─── Sub-Type Handlers ───────────────────────────────────────────

  const handleOpenSubTypes = (et: ExpenseType) => {
    setSelectedParentType(et);
    setIsSubTypeListOpen(true);
  };

  const handleOpenAddSubType = () => {
    setEditingSubType(null);
    setSubNameEn('');
    setSubNameBn('');
    setIsSubTypeFormOpen(true);
  };

  const handleOpenEditSubType = (st: ExpenseSubType) => {
    setEditingSubType(st);
    setSubNameEn(st.name_en);
    setSubNameBn(st.name_bn);
    setIsSubTypeFormOpen(true);
  };

  const handleSaveSubType = () => {
    if (!subNameEn.trim() || !subNameBn.trim() || !selectedParentType) return;

    if (editingSubType) {
      onUpdateSubType(editingSubType.id, subNameEn.trim(), subNameBn.trim());
    } else {
      onAddSubType(selectedParentType.id, subNameEn.trim(), subNameBn.trim());
    }
    setIsSubTypeFormOpen(false);
    setSubNameEn('');
    setSubNameBn('');
    setEditingSubType(null);
  };

  const handleDeleteSubType = (st: ExpenseSubType) => {
    Alert.alert(
      t('deleteSubTypeConfirmTitle'),
      t('deleteSubTypeConfirmMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => onDeleteSubType(st.id) },
      ],
    );
  };

  const subTypesForParent = selectedParentType
    ? expenseSubTypes.filter(st => st.expense_type_id === selectedParentType.id)
    : [];

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setIsOpen(true))
      ) : (
        <TouchableOpacity
          className="flex-row items-center px-4 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4"
          onPress={() => setIsOpen(true)}
        >
          <Settings size={16} color="#6366f1" />
          <Text className="text-sm font-semibold text-primary-600 dark:text-primary-400 ml-1.5">
            {t('manageTypes')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Types List Modal */}
      <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsOpen(false)}>
        <View className="flex-1 bg-white dark:bg-slate-900">
          <View className="flex-row justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
            <Text className="text-xl font-bold text-slate-900 dark:text-white">
              {t('manageTypes')}
            </Text>
            <TouchableOpacity onPress={() => setIsOpen(false)} className="p-2 -mr-2">
              <X color="#94a3b8" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-5">
            {expenseTypes.map((et) => {
              const subCount = expenseSubTypes.filter(st => st.expense_type_id === et.id).length;
              return (
                <View
                  key={et.id}
                  className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-3 border border-slate-100 dark:border-slate-700"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-3">
                      <Text className="text-base text-slate-900 dark:text-white" style={{ fontFamily }}>
                        {et.name_en}
                      </Text>
                      <Text className="text-sm text-slate-500 dark:text-slate-400 mt-0.5" style={{ fontFamily }}>
                        {et.name_bn}
                      </Text>
                    </View>
                    <View className="flex-row">
                      <TouchableOpacity
                        className="p-2 mr-1 rounded-lg bg-primary-50 dark:bg-primary-900/30"
                        onPress={() => handleOpenEdit(et)}
                      >
                        <Pencil size={16} color="#6366f1" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/30"
                        onPress={() => handleDelete(et)}
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Sub Types Button */}
                  <TouchableOpacity
                    className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700"
                    onPress={() => handleOpenSubTypes(et)}
                  >
                    <Text className="text-sm font-medium text-primary-600 dark:text-primary-400" style={{ fontFamily }}>
                      {t('subTypes')} {subCount > 0 ? `(${subCount})` : ''}
                    </Text>
                    <ChevronRight size={16} color="#6366f1" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          <View className="p-5 border-t border-slate-100 dark:border-slate-800">
            <TouchableOpacity
              className="bg-primary-600 active:bg-primary-700 flex-row items-center justify-center py-3.5 rounded-xl"
              onPress={handleOpenAdd}
            >
              <Plus color="white" size={20} />
              <Text className="text-white font-bold text-base ml-2">{t('addType')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Type Form Modal */}
      <Modal visible={isFormOpen} transparent animationType="fade" onRequestClose={() => setIsFormOpen(false)}>
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setIsFormOpen(false)}
        >
          <View
            className="bg-white dark:bg-slate-900 rounded-2xl p-5"
            onStartShouldSetResponder={() => true}
          >
            <Text className="text-xl font-bold text-slate-900 dark:text-white mb-5">
              {editingType ? t('editType') : t('addType')}
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('nameEnglish')} *
              </Text>
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white"
                placeholder={t('typeNameEnPlaceholder')}
                placeholderTextColor="#94a3b8"
                value={nameEn}
                onChangeText={setNameEn}
                style={{ fontFamily }}
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('nameBangla')} *
              </Text>
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white"
                placeholder={t('typeNameBnPlaceholder')}
                placeholderTextColor="#94a3b8"
                value={nameBn}
                onChangeText={setNameBn}
                style={{ fontFamily }}
              />
            </View>

            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 py-3.5 rounded-xl items-center mr-2 bg-slate-100 dark:bg-slate-800"
                onPress={() => setIsFormOpen(false)}
              >
                <Text className="font-bold text-slate-700 dark:text-slate-300">{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={cn(
                  "flex-1 py-3.5 rounded-xl items-center ml-2",
                  nameEn.trim() && nameBn.trim()
                    ? "bg-primary-600 active:bg-primary-700"
                    : "bg-primary-300 dark:bg-primary-900/50",
                )}
                disabled={!nameEn.trim() || !nameBn.trim()}
                onPress={handleSave}
              >
                <Text className={cn(
                  "font-bold",
                  nameEn.trim() && nameBn.trim() ? "text-white" : "text-primary-100 dark:text-primary-400/50",
                )}>
                  {t('save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sub-Types List Modal */}
      <Modal visible={isSubTypeListOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsSubTypeListOpen(false)}>
        <View className="flex-1 bg-white dark:bg-slate-900">
          <View className="flex-row justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
            <View className="flex-1 mr-3">
              <Text className="text-xl font-bold text-slate-900 dark:text-white">
                {t('manageSubTypes')}
              </Text>
              {selectedParentType && (
                <Text className="text-sm text-primary-600 dark:text-primary-400 mt-1" style={{ fontFamily }}>
                  {selectedParentType.name_en} / {selectedParentType.name_bn}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => setIsSubTypeListOpen(false)} className="p-2 -mr-2">
              <X color="#94a3b8" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-5">
            {subTypesForParent.length === 0 ? (
              <View className="items-center justify-center py-12">
                <Text className="text-slate-400 dark:text-slate-500 text-base" style={{ fontFamily }}>
                  {t('noSubTypes')}
                </Text>
              </View>
            ) : (
              subTypesForParent.map((st) => (
                <View
                  key={st.id}
                  className="flex-row items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-3 border border-slate-100 dark:border-slate-700"
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-base text-slate-900 dark:text-white" style={{ fontFamily }}>
                      {st.name_en}
                    </Text>
                    <Text className="text-sm text-slate-500 dark:text-slate-400 mt-0.5" style={{ fontFamily }}>
                      {st.name_bn}
                    </Text>
                  </View>
                  <View className="flex-row">
                    <TouchableOpacity
                      className="p-2 mr-1 rounded-lg bg-primary-50 dark:bg-primary-900/30"
                      onPress={() => handleOpenEditSubType(st)}
                    >
                      <Pencil size={16} color="#6366f1" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/30"
                      onPress={() => handleDeleteSubType(st)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View className="p-5 border-t border-slate-100 dark:border-slate-800">
            <TouchableOpacity
              className="bg-primary-600 active:bg-primary-700 flex-row items-center justify-center py-3.5 rounded-xl"
              onPress={handleOpenAddSubType}
            >
              <Plus color="white" size={20} />
              <Text className="text-white font-bold text-base ml-2">{t('addSubType')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Sub-Type Form Modal */}
      <Modal visible={isSubTypeFormOpen} transparent animationType="fade" onRequestClose={() => setIsSubTypeFormOpen(false)}>
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setIsSubTypeFormOpen(false)}
        >
          <View
            className="bg-white dark:bg-slate-900 rounded-2xl p-5"
            onStartShouldSetResponder={() => true}
          >
            <Text className="text-xl font-bold text-slate-900 dark:text-white mb-5">
              {editingSubType ? t('editSubType') : t('addSubType')}
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('nameEnglish')} *
              </Text>
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white"
                placeholder={t('subTypeNameEnPlaceholder')}
                placeholderTextColor="#94a3b8"
                value={subNameEn}
                onChangeText={setSubNameEn}
                style={{ fontFamily }}
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('nameBangla')} *
              </Text>
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white"
                placeholder={t('subTypeNameBnPlaceholder')}
                placeholderTextColor="#94a3b8"
                value={subNameBn}
                onChangeText={setSubNameBn}
                style={{ fontFamily }}
              />
            </View>

            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 py-3.5 rounded-xl items-center mr-2 bg-slate-100 dark:bg-slate-800"
                onPress={() => setIsSubTypeFormOpen(false)}
              >
                <Text className="font-bold text-slate-700 dark:text-slate-300">{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={cn(
                  "flex-1 py-3.5 rounded-xl items-center ml-2",
                  subNameEn.trim() && subNameBn.trim()
                    ? "bg-primary-600 active:bg-primary-700"
                    : "bg-primary-300 dark:bg-primary-900/50",
                )}
                disabled={!subNameEn.trim() || !subNameBn.trim()}
                onPress={handleSaveSubType}
              >
                <Text className={cn(
                  "font-bold",
                  subNameEn.trim() && subNameBn.trim() ? "text-white" : "text-primary-100 dark:text-primary-400/50",
                )}>
                  {t('save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
