<template>
    <div class="bg-gray-50 min-h-screen p-8">
        <h2 class="text-2xl font-bold mb-4 focus-visible:outline-yellow-300 focus-visible:outline-4 focus-visible:shadow-none rounded px-2 py-1" tabindex="0">Questionnaire : {{ centre?.name || '' }}</h2>
        <form @submit.prevent="submit">
            <fieldset v-for="theme in themes" :key="theme.name" class="bg-white border-2 border-cyan-700/100 rounded-xl p-8 mb-6">
                <legend class="px-6 text-xl font-semibold focus-visible:outline-yellow-300 focus-visible:outline-4 focus-visible:shadow-none rounded" tabindex="0">
                    <h3 class="inline">Thème {{ theme.name }}</h3>
                </legend>
                <div v-for="question in theme.questions" :key="question.id" class="mb-6 px-4">
                    <p 
                        class="block mb-3 text-lg font-medium focus-visible:outline-yellow-300 focus-visible:outline-4 focus-visible:shadow-none rounded px-2 py-1" 
                        :id="'question-label-' + question.id"
                        tabindex="0"
                    >
                        {{ question.name }}
                    </p>
                    <div 
                        role="radiogroup" 
                        class="flex flex-row flex-wrap gap-4 mb-3"
                    >
                        <label 
                            v-for="value in [1, 2, 3, 4, 5]" 
                            :key="value"
                            class="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                            <input
                                type="radio"
                                :name="'question-' + question.id"
                                :value="value"
                                :checked="answers[question.id]?.value === value"
                                @change="handleRadioChange(question.id, value)"
                                :aria-label="`Option ${value}`"
                                class="w-5 h-5 cursor-pointer focus-visible:outline-yellow-300 focus-visible:outline-4 focus-visible:shadow-none"
                            />
                            <span class="text-base">{{ value }}</span>
                        </label>
                    </div>
                    <div class="mt-3">
                        <label :for="'comment-' + question.id" class="block mb-2 text-sm text-gray-600">
                            Commentaire optionnel :
                        </label>
                        <textarea
                            :id="'comment-' + question.id"
                            :value="answers[question.id]?.comment || ''"
                            @input="handleCommentChange(question.id, ($event.target as HTMLTextAreaElement).value)"
                            placeholder="Ajoutez des détails si vous le souhaitez..."
                            rows="2"
                            class="border border-gray-300 p-2 w-full rounded focus-visible:outline-yellow-300 focus-visible:outline-4 focus-visible:shadow-none text-sm"
                        ></textarea>
                    </div>
                </div>
            </fieldset>
            <button 
                type="submit" 
                :disabled="isSubmitting"
                class="w-full bg-cyan-700 text-white cursor-pointer font-bold py-4 rounded-xl text-lg flex items-center justify-center hover:bg-cyan-800 focus-visible:outline-yellow-300 focus-visible:outline-4 focus-visible:bg-yellow-300 focus-visible:text-black focus-visible:shadow-none focus-visible:border-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer' }}
            </button>
        </form>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Center, Theme } from '@/assets/typings';

const route = useRoute();
const router = useRouter();
const centerId = route.params.id as string;


type Answer = {
    value: number;
    comment?: string;
};
const answers = ref<Record<number, Answer>>({});
const isSubmitting = ref(false);
const centre = ref<Center>();

const getCenterFromId = async (uuid: string): Promise<Center> => {
    const response = await fetch(`http://localhost:10000/centers/${uuid}`);
    const data = await response.json()
    centre.value = data
    return data;
};
getCenterFromId(centerId);
const handleRadioChange = (questionId: number, value: number) => {
    answers.value[questionId] = {
        value: value,
        comment: answers.value[questionId]?.comment || ''
    };
};

const handleCommentChange = (questionId: number, comment: string) => {
    if (answers.value[questionId]) {
        answers.value[questionId].comment = comment;
    } else {
        // Initialize with empty value if comment is added without selecting a checkbox
        answers.value[questionId] = {
            value: 0,
            comment: comment
        };
    }
};

const themes = ref<Array<Theme>>([])
const getThemes = async () => {
    const response = await fetch(`http://localhost:10000/forms`)
    const data = await response.json()
    themes.value = data
}
getThemes()

const submit = async () => {
    try {
        isSubmitting.value = true;
        // Format the answers for submission
        const formattedAnswers = Object.entries(answers.value)
            .filter(([_, answer]) => answer.value > 0) // Only include questions with selected values
            .map(([questionId, answer]) => ({
                question_id: questionId,
                value: String(answer.value),
                content: answer.comment || ''
            }));
        console.log('Formatted Answers:', formattedAnswers);

        const response = await fetch(`http://localhost:10000/forms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                center_id: centerId,
                answers: formattedAnswers
            })
        });
        console.log('Submission Response:', response);
        if (!response.ok) {
            throw new Error('Failed to submit form');
        }

        const result = await response.json();
        console.log('Form submitted successfully:', result);

        isSubmitting.value = false;
        router.push('/center/' + centerId);
        
    } catch (error) {
        console.error('Error submitting form:', error);
        isSubmitting.value = false;
        alert('Error submitting form. Please try again.');
    }
}
</script>