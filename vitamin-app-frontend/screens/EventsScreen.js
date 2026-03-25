import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { styled } from 'nativewind';
import { EVENTS } from '../context/AppContext'; // <--- NEW IMPORT (Named Export)
import { X, MapPin, Clock, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function EventsScreen() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
       <Animated.View entering={FadeInDown.duration(600)} className="mb-6 mt-2">
          <StyledText className="text-textLight text-xs font-bold uppercase tracking-widest mb-1">Campus Life</StyledText>
          <StyledText className="text-black text-4xl font-bold">Events & Fests</StyledText>
       </Animated.View>
       
       {/* CALENDAR STRIP */}
       <ScrollView horizontal className="mb-8" showsHorizontalScrollIndicator={false}>
          {[12,13,14,15,16,17,18].map((d, i) => (
             <Animated.View key={d} entering={FadeInDown.delay(i*100)} className="bg-surface mr-3 h-20 w-16 rounded-2xl items-center justify-center border border-border">
                <Text className="text-textLight font-bold text-xs">OCT</Text>
                <Text className="text-black text-2xl font-bold">{d}</Text>
             </Animated.View>
          ))}
       </ScrollView>

       {/* EVENTS LIST */}
       {EVENTS.map((event, i) => (
         <TouchableOpacity key={i} onPress={() => setSelectedEvent(event)}>
            <Animated.View entering={FadeInDown.delay(i*150)} className="bg-surface p-6 rounded-3xl border border-border mb-4 shadow-sm">
               <View className="flex-row justify-between items-start mb-2">
                  <Text className="bg-bg px-3 py-1 rounded-full text-primary font-bold text-[10px] uppercase border border-border">{event.type}</Text>
                  <Text className="text-black font-bold text-lg">{event.date.split(' ')[0]}</Text>
               </View>
               <StyledText className="text-black text-xl font-bold mb-1">{event.title}</StyledText>
               <StyledText className="text-textLight">{event.loc} • {event.time}</StyledText>
            </Animated.View>
         </TouchableOpacity>
       ))}

       {/* EVENT DETAIL POPUP */}
       <Modal visible={!!selectedEvent} transparent={true} animationType="slide" onRequestClose={() => setSelectedEvent(null)}>
          <View className="flex-1 justify-end bg-black/50">
             <View className="bg-surface h-[50%] rounded-t-[40px] p-8 shadow-2xl">
                {selectedEvent && (
                  <>
                    <View className="flex-row justify-between items-center mb-6">
                       <Text className="text-primary font-bold uppercase tracking-widest">{selectedEvent.org}</Text>
                       <TouchableOpacity onPress={() => setSelectedEvent(null)}><X size={28} color="black"/></TouchableOpacity>
                    </View>
                    
                    <Text className="text-3xl font-bold text-black mb-4 leading-tight">{selectedEvent.title}</Text>
                    
                    <View className="space-y-4 mb-8 bg-bg p-6 rounded-2xl border border-border">
                       <View className="flex-row items-center"><Clock size={20} color="gray"/><Text className="ml-3 text-lg text-black font-medium">{selectedEvent.date} @ {selectedEvent.time}</Text></View>
                       <View className="flex-row items-center"><MapPin size={20} color="gray"/><Text className="ml-3 text-lg text-black font-medium">{selectedEvent.loc}</Text></View>
                    </View>
                    
                    <TouchableOpacity className="bg-black h-16 rounded-2xl items-center justify-center flex-row shadow-lg">
                       <Text className="text-white font-bold text-xl mr-2">RSVP Now</Text>
                       <ArrowRight color="white" size={20} />
                    </TouchableOpacity>
                  </>
                )}
             </View>
          </View>
       </Modal>
    </ScrollView>
  );
}