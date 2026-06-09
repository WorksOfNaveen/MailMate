// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const generativeScreen = () => {
//   return (
//     <View>
//       <Text>generativeScreen</Text>
//     </View>
//   )
// }

// export default generativeScreen

// const styles = StyleSheet.create({})

import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { initLlama } from 'llama.rn';
import ReactNativeBlobUtil from 'react-native-blob-util';

// Ensure this matches the exact filename you uploaded to the folder
const MODEL_NAME = 'Qwen3.5-2B-Q4_K_M.gguf';
// const MODEL_PATH = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${MODEL_NAME}`;
const MODEL_PATH = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/Qwen3.5-2B-Q4_K_M.gguf`;
console.log(ReactNativeBlobUtil.fs.dirs.DocumentDir);
export default function GenerativeScreen() {
  const [status, setStatus] = useState('Ready to load local model.');
  const [answer, setAnswer] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleInference = async () => {
    setIsThinking(true);
    setAnswer('');

    try {
      // 1. Verify file exists in the public Downloads directory
      const fileExists = await ReactNativeBlobUtil.fs.exists(MODEL_PATH);
      console.log(fileExists);
      if (!fileExists) {
        setStatus(
          `Error: Could not find "${MODEL_NAME}" in your device's Downloads folder.`,
        );
        setIsThinking(false);
        return;
      }

      setStatus('Loading model from internal storage into RAM...');

      // 2. Instantiate the local llama.cpp context via the C++ bridge
      const context = await initLlama({
        model: MODEL_PATH,
        n_ctx: 4048, // Allocation size for text token memory
        use_mlock: true, // Prevents Android OS from swapping model out of active RAM
        n_gpu_layers: 99,
      });

      setStatus('Processing offline prompt...');

      // 3. Format the chat prompt using Qwen's ChatML template structure
      const prompt =
        '<|im_start|>user\nWrite a mail to HR about you resign from the post of SDE-1 on 12th of august in 2026 and make it look sad <|im_end|>\n<|im_start|>assistant\n';

      // 4. Run native execution
      const result = await context.completion({
        prompt: prompt,
        n_predict: 100, // Hard cap on generation length to save battery/compute
        temperature: 0.7,
      });

      setAnswer(result.text);
      setStatus('Inference complete.');

      // 5. CRITICAL: Explicitly release the context to prevent memory leaks!
      await context.release();
    } catch (error: any) {
      setAnswer(`Execution Error: ${error.message}`);
      setStatus('Failed.');
    }

    setIsThinking(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Offline Local AI Explorer</Text>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <View style={styles.outputContainer}>
        {isThinking ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <Text style={styles.outputText}>
            {answer || 'Press the button to trigger local execution.'}
          </Text>
        )}
      </View>

      <Button
        title="Execute Local Inference"
        onPress={handleInference}
        disabled={isThinking}
        color="#007AFF"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#111111',
  },
  statusContainer: {
    padding: 16,
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555555',
    fontWeight: '500',
  },
  outputContainer: {
    minHeight: 180,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 12,
    marginBottom: 24,
    justifyContent: 'center',
  },
  outputText: { fontSize: 16, lineHeight: 24, color: '#333333' },
});
// /storage/self/primary/Download/Qwen3.5-2B-Q4_K_M.gguf
