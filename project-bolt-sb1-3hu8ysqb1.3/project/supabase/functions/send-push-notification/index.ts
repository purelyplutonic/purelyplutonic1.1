import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
}

interface PushNotificationRequest {
  userIds: string[]
  title: string
  body: string
  data?: Record<string, any>
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { userIds, title, body, data }: PushNotificationRequest = await req.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'userIds array is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { data: tokens, error } = await supabase
      .from('device_tokens')
      .select('token, platform')
      .in('user_id', userIds)

    if (error) {
      throw error
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No device tokens found for specified users' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const results = []

    for (const deviceToken of tokens) {
      if (deviceToken.platform === 'web') {
        continue
      }

      if (!fcmServerKey) {
        console.warn('FCM_SERVER_KEY not configured, skipping push notification')
        continue
      }

      try {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${fcmServerKey}`,
          },
          body: JSON.stringify({
            to: deviceToken.token,
            notification: {
              title,
              body,
              sound: 'default',
            },
            data: data || {},
            priority: 'high',
          }),
        })

        const result = await response.json()
        results.push({
          token: deviceToken.token.substring(0, 10) + '...',
          success: response.ok,
          result,
        })

        if (!response.ok && result.results?.[0]?.error === 'NotRegistered') {
          await supabase
            .from('device_tokens')
            .delete()
            .eq('token', deviceToken.token)
        }
      } catch (error) {
        console.error('Error sending push notification:', error)
        results.push({
          token: deviceToken.token.substring(0, 10) + '...',
          success: false,
          error: error.message,
        })
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Push notifications sent',
        results,
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in send-push-notification function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
