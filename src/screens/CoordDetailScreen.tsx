import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { supabase } from '../lib/supabase'
import { Colors } from '../constants/colors'
import { CoordRecord } from '../types'
import { RootStackParamList } from '../navigation/AppNavigator'

type DetailNavProp = NativeStackNavigationProp<RootStackParamList, 'CoordDetail'>
type DetailRouteProp = RouteProp<RootStackParamList, 'CoordDetail'>

const { width } = Dimensions.get('window')

export default function CoordDetailScreen() {
  const navigation = useNavigation<DetailNavProp>()
  const route = useRoute<DetailRouteProp>()
  const { coordId } = route.params

  const [record, setRecord] = useState<CoordRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  useEffect(() => {
    const fetchRecord = async () => {
      const { data, error } = await supabase
        .from('coord_records')
        .select('*')
        .eq('id', coordId)
        .single()

      if (!error && data) setRecord(data)
      setLoading(false)
    }
    fetchRecord()
  }, [coordId])

  const handleDelete = () => {
    Alert.alert('削除の確認', 'このコーデを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          if (!record) return
          setDeleting(true)
          try {
            const { error: dbError } = await supabase
              .from('coord_records')
              .delete()
              .eq('id', record.id)

            if (dbError) throw dbError

            // Storageからも削除（URLからパスを抽出）
            const urlParts = record.photo_url.split('/tenue-photos/')
            if (urlParts.length > 1) {
              await supabase.storage.from('tenue-photos').remove([urlParts[1]])
            }

            navigation.goBack()
          } catch (e: any) {
            Alert.alert('エラー', e.message || '削除に失敗しました。')
          } finally {
            setDeleting(false)
          }
        },
      },
    ])
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.main} />
      </View>
    )
  }

  if (!record) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: Colors.subText }}>データが見つかりません</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} disabled={deleting}>
          {deleting ? (
            <ActivityIndicator size="small" color="#E05A5A" />
          ) : (
            <Text style={styles.deleteText}>削除</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.photoContainer}>
        <Image
          source={{ uri: record.photo_url }}
          style={styles.photo}
          resizeMode="contain"
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />
        {imageLoading && (
          <View style={styles.imageLoadingOverlay}>
            <ActivityIndicator color={Colors.main} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.dateLabel}>着用日</Text>
        <Text style={styles.dateValue}>{record.worn_at}</Text>

        {record.comment ? (
          <>
            <Text style={styles.commentLabel}>コメント</Text>
            <Text style={styles.commentText}>{record.comment}</Text>
          </>
        ) : null}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backText: {
    color: Colors.main,
    fontSize: 15,
  },
  deleteText: {
    color: '#E05A5A',
    fontSize: 15,
  },
  photoContainer: {
    width: width,
    height: Math.round(width * 1.35),
    backgroundColor: Colors.base,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.base,
  },
  info: {
    padding: 20,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.subText,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 16,
  },
  commentLabel: {
    fontSize: 12,
    color: Colors.subText,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
  },
})
