import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { supabase } from '../lib/supabase'
import { Colors } from '../constants/colors'
import { RootStackParamList } from '../navigation/AppNavigator'

type AddCoordNavProp = NativeStackNavigationProp<RootStackParamList, 'AddCoord'>

export default function AddCoordScreen() {
  const navigation = useNavigation<AddCoordNavProp>()
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  const scrollRef = useRef<ScrollView>(null)
  const today = new Date().toISOString().split('T')[0]

  const compressImage = async (uri: string, width: number, height: number): Promise<string> => {
    const MAX = 1200
    const longestSide = Math.max(width, height)
    const actions: ImageManipulator.Action[] = []

    if (longestSide > MAX) {
      const scale = MAX / longestSide
      actions.push({ resize: { width: Math.round(width * scale), height: Math.round(height * scale) } })
    }

    const result = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
    })
    return result.uri
  }

  const pickImage = async (fromCamera: boolean) => {
    if (fromCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('エラー', 'カメラへのアクセスを許可してください。')
        return
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      })
      if (!result.canceled) {
        const asset = result.assets[0]
        const compressed = await compressImage(asset.uri, asset.width, asset.height)
        setImageUri(compressed)
        setImageSize({ width: asset.width, height: asset.height })
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('エラー', 'フォトライブラリへのアクセスを許可してください。')
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      })
      if (!result.canceled) {
        const asset = result.assets[0]
        const compressed = await compressImage(asset.uri, asset.width, asset.height)
        setImageUri(compressed)
        setImageSize({ width: asset.width, height: asset.height })
      }
    }
  }

  const handlePhotoTap = () => {
    Alert.alert('写真を選択', '', [
      { text: 'カメラで撮影', onPress: () => pickImage(true) },
      { text: 'フォトライブラリ', onPress: () => pickImage(false) },
      { text: 'キャンセル', style: 'cancel' },
    ])
  }

  const handleSave = async () => {
    if (!imageUri) {
      Alert.alert('エラー', '写真を選択してください。')
      return
    }

    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('未ログインです。')

      const rawExt = imageUri.split('.').pop()?.toLowerCase().split('?')[0] || 'jpg'
      const ext = rawExt === 'jpg' ? 'jpg' : rawExt
      const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
      const fileName = `${user.id}/${Date.now()}.${ext}`

      let arrayBuffer: ArrayBuffer
      try {
        const response = await fetch(imageUri)
        arrayBuffer = await response.arrayBuffer()
      } catch (fetchErr: any) {
        throw new Error(`画像の読み込みに失敗しました: ${fetchErr.message}`)
      }

      const { error: uploadError } = await supabase.storage
        .from('tenue-photos')
        .upload(fileName, arrayBuffer, { contentType: mimeType })

      if (uploadError) {
        throw new Error(
          `アップロードエラー: ${uploadError.message}\nステータス: ${(uploadError as any).statusCode ?? ''}`
        )
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('tenue-photos').getPublicUrl(fileName)

      const { error: insertError } = await supabase.from('coord_records').insert({
        user_id: user.id,
        photo_url: publicUrl,
        comment: comment.trim() || null,
        worn_at: today,
      })

      if (insertError) throw new Error(`DB保存エラー: ${insertError.message}`)

      navigation.goBack()
    } catch (e: any) {
      Alert.alert('エラー', e.message || '保存に失敗しました。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>キャンセル</Text>
        </TouchableOpacity>
        <Text style={styles.title}>コーデを記録</Text>
        <View style={{ width: 60 }} />
      </View>

      <TouchableOpacity
        style={[
          styles.photoArea,
          imageUri && imageSize
            ? { aspectRatio: imageSize.width / imageSize.height }
            : { height: 260 },
        ]}
        onPress={handlePhotoTap}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoIcon}>📷</Text>
            <Text style={styles.photoHint}>タップして写真を追加</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.field}>
        <Text style={styles.label}>日付</Text>
        <Text style={styles.dateValue}>{today}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>コメント</Text>
        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="今日のコーデについて..."
          placeholderTextColor="#8C7B6B"
          multiline
          maxLength={200}
          onFocus={() => {
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300)
          }}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>保存する</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
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
  cancelText: {
    color: Colors.subText,
    fontSize: 15,
    width: 60,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  photoArea: {
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  photoIcon: {
    fontSize: 40,
  },
  photoHint: {
    color: Colors.subText,
    fontSize: 14,
  },
  field: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  label: {
    fontSize: 12,
    color: Colors.subText,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  commentInput: {
    fontSize: 15,
    color: '#2C1A0E',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    margin: 16,
    marginTop: 32,
    backgroundColor: Colors.main,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
})
