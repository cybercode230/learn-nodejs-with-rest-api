import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Map, Search, Globe } from './icons';
import { ThemedText } from './themed-text';
import { useSearch } from '@/hooks/use-search';
import { ms } from 'react-native-size-matters';

/**
 * Airbnb-style professional Search Modal.
 * Implements the "Where to?", "Check in/out", and "Who" steps.
 */
export function SearchModal({ onClose }: { onClose: () => void }) {
  const { searchQuery, setSearchQuery } = useSearch();
  const [activeStep, setActiveStep] = useState<'where' | 'when' | 'who'>('where');
  const [activeDateTab, setActiveDateTab] = useState('Dates');
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [selectedGuests, setSelectedGuests] = useState('Add guests');
  const [destination, setDestination] = useState(searchQuery);

  const handleSearch = () => {
    setSearchQuery(destination);
    onClose();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={onClose}
          style={styles.closeButton}
        >
          <X size={ms(18)} color="#000000" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerTitle}>Stays</ThemedText>
        </View>
        
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Where to section */}
        <View style={[styles.section, activeStep === 'where' ? styles.activeSection : styles.inactiveSection]}>
          <TouchableOpacity 
            onPress={() => setActiveStep('where')}
            style={styles.sectionHeader}
            disabled={activeStep === 'where'}
          >
            <ThemedText style={styles.sectionTitle}>Where to?</ThemedText>
            {activeStep !== 'where' && (
              <ThemedText style={styles.selectionSummary}>{destination || 'Search destinations'}</ThemedText>
            )}
          </TouchableOpacity>

          {activeStep === 'where' && (
            <View style={styles.sectionContent}>
              <View style={styles.searchBar}>
                <Search size={ms(20)} color="#717171" />
                <TextInput 
                  placeholder="Search destinations"
                  style={styles.textInput}
                  placeholderTextColor="#717171"
                  value={destination}
                  onChangeText={setDestination}
                />
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionsScroll}>
                {['I\'m flexible', 'Europe', 'Canada', 'United States', 'Rwanda'].map((region, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={styles.regionItem}
                    onPress={() => setDestination(region === 'I\'m flexible' ? '' : region)}
                  >
                    <View style={[styles.regionImagePlaceholder, destination === region && styles.activeRegion]}>
                       {region === 'I\'m flexible' ? (
                         <Globe size={ms(32)} color={destination === region ? '#FF385C' : '#717171'} />
                       ) : (
                         <Map size={ms(32)} color={destination === region ? '#FF385C' : '#717171'} />
                       )}
                    </View>
                    <ThemedText style={styles.regionName}>{region}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* When section */}
        <View style={[styles.section, activeStep === 'when' ? styles.activeSection : styles.inactiveSection]}>
          <TouchableOpacity 
            onPress={() => setActiveStep('when')}
            style={styles.sectionHeader}
          >
            <ThemedText style={styles.inactiveLabel}>When</ThemedText>
            <ThemedText style={activeStep === 'when' ? styles.activeValue : styles.inactiveValue}>
              {checkIn && checkOut ? `${checkIn} - ${checkOut}` : 'Add dates'}
            </ThemedText>
          </TouchableOpacity>

          {activeStep === 'when' && (
            <View style={styles.sectionContent}>
              <View style={styles.tabContainer}>
                {['Dates', 'Months', 'Flexible'].map((tab) => (
                  <TouchableOpacity 
                    key={tab}
                    style={[styles.tab, activeDateTab === tab && styles.activeTab]}
                    onPress={() => setActiveDateTab(tab)}
                  >
                    <ThemedText style={[styles.tabText, activeDateTab === tab && styles.activeTabText]}>{tab}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.calendarContainer}>
                <ThemedText style={styles.monthTitle}>May 2026</ThemedText>
                <View style={styles.daysGrid}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <ThemedText key={d} style={styles.dayHeader}>{d}</ThemedText>
                  ))}
                  {Array.from({ length: 31 }).map((_, i) => {
                    const day = i + 1;
                    const isPast = day < 14; // Today is May 14
                    const isSelected = day === 14 || day === 19;
                    const isInRange = day > 14 && day < 19;
                    
                    return (
                      <TouchableOpacity 
                        key={i} 
                        disabled={isPast}
                        onPress={() => {
                          if (!checkIn) setCheckIn(`May ${day}`);
                          else if (!checkOut) setCheckOut(`May ${day}`);
                          else { setCheckIn(`May ${day}`); setCheckOut(null); }
                        }}
                        style={[
                          styles.dayButton,
                          isPast && styles.pastDay,
                          isSelected && styles.selectedDay,
                          isInRange && styles.rangeDay
                        ]}
                      >
                        <ThemedText style={[
                          styles.dayText, 
                          isPast && styles.pastDayText,
                          isSelected && styles.selectedDayText
                        ]}>
                          {day}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={styles.yearWarning}>
                   <ThemedText style={styles.warningText}>
                     * You can only book for 2026 and future years. Past dates are disabled.
                   </ThemedText>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Who section */}
        <View style={[styles.section, activeStep === 'who' ? styles.activeSection : styles.inactiveSection]}>
          <TouchableOpacity 
            onPress={() => setActiveStep('who')}
            style={styles.sectionHeader}
          >
            <ThemedText style={styles.inactiveLabel}>Who</ThemedText>
            <ThemedText style={activeStep === 'who' ? styles.activeValue : styles.inactiveValue}>{selectedGuests}</ThemedText>
          </TouchableOpacity>

          {activeStep === 'who' && (
            <View style={styles.sectionContent}>
              <ThemedText style={styles.pickerSubtitle}>Add guests</ThemedText>
              <View style={styles.guestPickerRow}>
                <View>
                  <ThemedText style={styles.guestLabel}>Adults</ThemedText>
                  <ThemedText style={styles.guestSubtitle}>Ages 13 or above</ThemedText>
                </View>
                <View style={styles.counterRow}>
                  <TouchableOpacity style={styles.counterButton} onPress={() => setSelectedGuests('1 guest')}><ThemedText>-</ThemedText></TouchableOpacity>
                  <ThemedText style={styles.counterValue}>1</ThemedText>
                  <TouchableOpacity style={styles.counterButton} onPress={() => setSelectedGuests('2 guests')}><ThemedText>+</ThemedText></TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => { setDestination(''); setCheckIn(null); setCheckOut(null); setSelectedGuests('Add guests'); setSearchQuery(''); }}>
          <ThemedText type="link" style={styles.clearAll}>Clear all</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Search size={ms(18)} color="#FFFFFF" />
          <View style={{ width: ms(8) }} />
          <ThemedText style={styles.searchButtonText}>Search</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    paddingHorizontal: ms(20),
    paddingVertical: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    padding: ms(8),
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: ms(20),
    backgroundColor: '#FFFFFF',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: ms(16),
    fontFamily: 'Figtree-Bold',
    color: '#222222',
  },
  spacer: {
    width: ms(40),
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: ms(20),
    paddingTop: ms(20),
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(24),
    marginBottom: ms(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
  },
  activeSection: {
    padding: ms(24),
  },
  inactiveSection: {
    paddingHorizontal: ms(24),
    paddingVertical: ms(16),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: ms(22),
    fontFamily: 'Figtree-Bold',
    color: '#222222',
  },
  selectionSummary: {
    color: '#222222',
    fontFamily: 'Figtree-SemiBold',
    fontSize: ms(14),
  },
  sectionContent: {
    marginTop: ms(20),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: ms(12),
    paddingHorizontal: ms(16),
    paddingVertical: ms(12),
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  textInput: {
    marginLeft: ms(12),
    flex: 1,
    fontFamily: 'Figtree-Regular',
    fontSize: ms(16),
    color: '#222222',
  },
  regionsScroll: {
    marginTop: ms(24),
  },
  regionItem: {
    marginRight: ms(16),
    alignItems: 'center',
  },
  regionImagePlaceholder: {
    width: ms(96),
    height: ms(96),
    backgroundColor: '#F7F7F7',
    borderRadius: ms(16),
    marginBottom: ms(8),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  activeRegion: {
    borderColor: '#FF385C',
    backgroundColor: '#FFF0F3',
  },
  regionName: {
    fontSize: ms(12),
    color: '#222222',
    fontFamily: 'Figtree-Regular',
  },
  inactiveLabel: {
    color: '#717171',
    fontFamily: 'Figtree-SemiBold',
    fontSize: ms(14),
  },
  inactiveValue: {
    color: '#222222',
    fontFamily: 'Figtree-SemiBold',
    fontSize: ms(14),
  },
  activeValue: {
    color: '#222222',
    fontFamily: 'Figtree-Bold',
    fontSize: ms(18),
    marginTop: ms(4),
  },
  pickerSubtitle: {
    fontSize: ms(16),
    fontFamily: 'Figtree-SemiBold',
    marginBottom: ms(16),
  },
  guestPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guestLabel: {
    fontSize: ms(16),
    fontFamily: 'Figtree-SemiBold',
  },
  guestSubtitle: {
    fontSize: ms(14),
    color: '#717171',
    fontFamily: 'Figtree-Regular',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(16),
  },
  counterButton: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: ms(16),
    fontFamily: 'Figtree-SemiBold',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingHorizontal: ms(24),
    paddingVertical: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearAll: {
    fontSize: ms(16),
    textDecorationLine: 'underline',
    fontFamily: 'Figtree-SemiBold',
  },
  searchButton: {
    backgroundColor: '#FF385C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(24),
    paddingVertical: ms(14),
    borderRadius: ms(12),
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Figtree-Bold',
    fontSize: ms(16),
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    padding: ms(4),
    borderRadius: ms(24),
    marginBottom: ms(20),
  },
  tab: {
    flex: 1,
    paddingVertical: ms(8),
    alignItems: 'center',
    borderRadius: ms(20),
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: ms(14),
    fontFamily: 'Figtree-SemiBold',
    color: '#717171',
  },
  activeTabText: {
    color: '#222222',
  },
  calendarContainer: {
    marginTop: ms(10),
  },
  monthTitle: {
    fontSize: ms(18),
    fontFamily: 'Figtree-Bold',
    marginBottom: ms(16),
    color: '#222222',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: ms(12),
    color: '#717171',
    fontFamily: 'Figtree-Medium',
    marginBottom: ms(12),
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ms(4),
  },
  dayText: {
    fontSize: ms(14),
    fontFamily: 'Figtree-Medium',
    color: '#222222',
  },
  pastDay: {
    opacity: 0.3,
  },
  pastDayText: {
    textDecorationLine: 'line-through',
  },
  selectedDay: {
    backgroundColor: '#222222',
    borderRadius: ms(20),
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  rangeDay: {
    backgroundColor: '#F7F7F7',
  },
  yearWarning: {
    marginTop: ms(20),
    padding: ms(12),
    backgroundColor: '#FFF8F1',
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: '#FFE5D0',
  },
  warningText: {
    fontSize: ms(12),
    color: '#91472C',
    fontFamily: 'Figtree-Medium',
    lineHeight: ms(18),
  },
});
