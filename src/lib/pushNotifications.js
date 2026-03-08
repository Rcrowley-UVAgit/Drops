import { supabase } from './supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

function isNativePlatform() {
  try {
    return window.Capacitor?.isNativePlatform?.() ?? false
  } catch { return false }
}

// ─── Native (Capacitor/APNs) ─────────────────────────────────

let nativeListenerCleanups = []

async function initNativePush(userId) {
  const { PushNotifications } = await import('@capacitor/push-notifications')

  const permResult = await PushNotifications.requestPermissions()
  if (permResult.receive !== 'granted') return

  await PushNotifications.register()

  const tokenListener = await PushNotifications.addListener('registration', async (token) => {
    await supabase
      .from('device_tokens')
      .upsert(
        { user_id: userId, token: token.value, platform: 'ios', updated_at: new Date().toISOString() },
        { onConflict: 'user_id,token' }
      )
  })

  const errorListener = await PushNotifications.addListener('registrationError', (err) => {
    console.error('Push registration error:', err)
  })

  const foregroundListener = await PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received in foreground:', notification)
  })

  const tapListener = await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('Push notification tapped:', action)
  })

  nativeListenerCleanups = [tokenListener, errorListener, foregroundListener, tapListener]
}

async function removeNativePush(userId) {
  await supabase.from('device_tokens').delete().eq('user_id', userId).eq('platform', 'ios')
  for (const listener of nativeListenerCleanups) {
    await listener.remove()
  }
  nativeListenerCleanups = []
}

// ─── Web Push ─────────────────────────────────────────────────

async function initWebPush(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
  if (!VAPID_PUBLIC_KEY) return

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return

  const registration = await navigator.serviceWorker.ready
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
  }

  await supabase
    .from('device_tokens')
    .upsert(
      {
        user_id: userId,
        token: JSON.stringify(subscription.toJSON()),
        platform: 'web',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,token' }
    )
}

async function removeWebPush(userId) {
  try {
    const registration = await navigator.serviceWorker?.ready
    const subscription = await registration?.pushManager?.getSubscription()
    if (subscription) await subscription.unsubscribe()
  } catch (e) {
    console.error('Error unsubscribing web push:', e)
  }

  await supabase.from('device_tokens').delete().eq('user_id', userId).eq('platform', 'web')
}

// ─── Public API ───────────────────────────────────────────────

export async function initPushNotifications(userId) {
  if (isNativePlatform()) {
    return initNativePush(userId)
  }
  return initWebPush(userId)
}

export async function removePushToken(userId) {
  if (isNativePlatform()) {
    return removeNativePush(userId)
  }
  return removeWebPush(userId)
}
