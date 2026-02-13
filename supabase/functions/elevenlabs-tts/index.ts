import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

import { corsHeaders } from "../_shared/cors.ts";

// Premium voice IDs for different languages/styles
const VOICES = {
  narrator: 'onwK4e9ZLuTAKqWW03F9', // Daniel - clear narration
  guide: 'JBFqnCBsd6RMkjVDRZzb',    // George - warm guide
  expert: 'EXAVITQu4vr4xnSDxMaL',   // Sarah - professional
  friendly: 'XrExE9yKIg1WjnnlVkGX', // Matilda - friendly
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId, voiceStyle, options } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ success: false, error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'ElevenLabs connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Select voice based on style or use provided voiceId
    const selectedVoice = voiceId || VOICES[voiceStyle as keyof typeof VOICES] || VOICES.narrator;

    console.log('Generating TTS for text length:', text.length, 'voice:', selectedVoice);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: options?.model || 'eleven_multilingual_v2',
          voice_settings: {
            stability: options?.stability ?? 0.5,
            similarity_boost: options?.similarityBoost ?? 0.75,
            style: options?.style ?? 0.3,
            use_speaker_boost: true,
            speed: options?.speed ?? 1.0,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `ElevenLabs error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(audioBuffer);

    console.log('TTS generation successful, audio size:', audioBuffer.byteLength);

    return new Response(
      JSON.stringify({
        success: true,
        audioContent: base64Audio,
        format: 'mp3',
        voice: selectedVoice
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating TTS:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate audio';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
