import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { supabase } from '../lib/supabase'
import { Colors } from '../constants/colors'
import { CoordRecord } from '../types'
import { RootStackParamList } from '../navigation/AppNavigator'

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>

const { width } = Dimensions.get('window')
const ITEM_SIZE = (width - 1) / 2

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>()
  const [records, setRecords] = useState<CoordRecord[]>([])
  const [loading, setLoading] = useState(false)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('coord_records')
      .select('*')
      .eq('user_id', user.id)
      .order('worn_at', { ascending: false })

    if (!error && data) setRecords(data)
    setLoading(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchRecords()
    }, [fetchRecords])
  )

  const handleLogout = () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ])
  }

  const renderItem = ({ item }: { item: CoordRecord }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => navigation.navigate('CoordDetail', { coordId: item.id })}
    >
      <Image source={{ uri: item.photo_url }} style={styles.thumbnail} />
      <Text style={styles.dateText}>{item.worn_at}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>tenue</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>

      {records.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>最初の装いを、残してみよう。</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderItem}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddCoord')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logo: {
    fontSize: 24,
    color: Colors.main,
    letterSpacing: 4,
    fontWeight: '300',
  },
  logoutText: {
    color: Colors.subText,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.subText,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  listContent: {
    padding: 0,
  },
  columnWrapper: {
    gap: 1,
    marginBottom: 1,
  },
  gridItem: {
    width: ITEM_SIZE,
    backgroundColor: Colors.base,
  },
  thumbnail: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    resizeMode: 'cover',
  },
  dateText: {
    fontSize: 11,
    color: Colors.subText,
    padding: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
  },
})
