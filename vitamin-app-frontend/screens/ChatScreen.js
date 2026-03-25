import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { styled } from 'nativewind';
import { AppContext } from '../context/AppContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Search, Send, ArrowLeft, Check, CheckCheck } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function ChatScreen() {
  const { currentUser, allUsers } = useContext(AppContext);
  const [activeChatId, setActiveChatId] = useState(null);

  const potentialBuddies = allUsers.filter(u => u.id !== currentUser.id);

  if (activeChatId) {
    const buddy = allUsers.find(u => u.id === activeChatId);
    return <ChatWindow buddy={buddy} onBack={() => setActiveChatId(null)} />;
  }

  return (
    <StyledView className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View entering={FadeInDown.duration(600)} className="mb-6 mt-2">
          <StyledText className="text-textLight text-xs font-bold uppercase tracking-widest mb-1">Messages</StyledText>
          <StyledText className="text-black text-4xl font-bold tracking-tight">Inbox</StyledText>
        </Animated.View>

        {potentialBuddies.map((buddy, index) => {
           const myChats = currentUser.chats[buddy.id] || [];
           const theirChats = buddy.chats[currentUser.id] || [];
           const lastMsg = myChats.length > 0 ? myChats[myChats.length-1] : (theirChats.length > 0 ? theirChats[theirChats.length-1] : null);
           
           return (
            <TouchableOpacity key={buddy.id} onPress={() => setActiveChatId(buddy.id)}>
              <Animated.View entering={FadeInDown.delay(index * 100)} className="flex-row items-center bg-surface border border-border p-5 rounded-3xl mb-4 shadow-sm">
                <StyledView className="h-14 w-14 bg-bg rounded-full items-center justify-center mr-4 border border-border">
                  <StyledText className="text-black font-bold text-xl">{buddy.avatar}</StyledText>
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-black font-bold text-lg">{buddy.name}</StyledText>
                  <StyledText className="text-textLight text-sm" numberOfLines={1}>{lastMsg ? lastMsg.text : "Start a conversation..."}</StyledText>
                </StyledView>
              </Animated.View>
            </TouchableOpacity>
           );
        })}
      </ScrollView>
    </StyledView>
  );
}

function ChatWindow({ buddy, onBack }) {
  const { currentUser, allUsers, setAllUsers } = useContext(AppContext);
  const [msg, setMsg] = useState('');
  
  const mySent = currentUser.chats[buddy.id] || [];
  const theirSent = buddy.chats[currentUser.id] || [];
  const allMessages = [...mySent.map(m => ({ ...m, type: 'sent' })), ...theirSent.map(m => ({ ...m, type: 'received' }))].sort((a,b) => a.timestamp - b.timestamp);

  const sendMessage = () => {
    if(!msg.trim()) return;
    const newMessage = { text: msg, sender: 'me', status: 'delivered', timestamp: Date.now() };
    const updatedUsers = [...allUsers];
    const meIndex = updatedUsers.findIndex(u => u.id === currentUser.id);
    if (!updatedUsers[meIndex].chats[buddy.id]) updatedUsers[meIndex].chats[buddy.id] = [];
    updatedUsers[meIndex].chats[buddy.id].push(newMessage);
    setAllUsers(updatedUsers);
    setMsg('');
  };

  return (
    <View className="flex-1 bg-bg -mx-6 -mt-2">
      <View className="flex-row items-center px-6 pt-4 pb-4 bg-surface border-b border-border shadow-sm z-10">
        <TouchableOpacity onPress={onBack} className="mr-4"><ArrowLeft size={24} color="black" /></TouchableOpacity>
        <Text className="text-black font-bold text-lg">{buddy.name}</Text>
      </View>
      <ScrollView className="flex-1 px-6 pt-6 bg-bg">
        {allMessages.map((m, i) => (
          <View key={i} className={`flex-row mb-4 ${m.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
            <View className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${m.type === 'sent' ? 'bg-primary rounded-tr-none' : 'bg-surface border border-border rounded-tl-none'}`}>
               <Text className={`text-sm font-medium ${m.type === 'sent' ? 'text-white' : 'text-black'}`}>{m.text}</Text>
               {m.type === 'sent' && (
                 <View className="flex-row justify-end mt-1">
                    {m.status === 'delivered' && <CheckCheck size={12} color="white" opacity={0.7} />}
                    {m.status === 'seen' && <CheckCheck size={12} color="#93C5FD" />} 
                 </View>
               )}
            </View>
          </View>
        ))}
        <View className="h-24" /> 
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-surface border-t border-border">
        <View className="flex-row items-center bg-bg rounded-full px-2 border border-border h-14">
           <TextInput value={msg} onChangeText={setMsg} placeholder="Type..." className="flex-1 p-4 text-black" />
           <TouchableOpacity onPress={sendMessage} className="h-10 w-10 bg-black rounded-full items-center justify-center m-1"><Send size={18} color="white" /></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}