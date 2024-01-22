<template>
  <div v-if="pageLoaded" class="max-w-lg w-full mx-auto pt-6 pb-12 px-8">
    <div class="border-b border-gray-200 bg-white pb-5">
      <div
        class="-ml-4 -mt-4 flex flex-wrap items-start justify-between sm:flex-nowrap"
      >
        <div class="ml-4 mt-4">
          <div class="mb-4">
            <a
              href="#"
              class="uppercase text-xs font-semibold text-indigo-600 hover:underline hover:text-indigo-400"
              @click.prevent="attemptToOpenBackupModal()"
            >
              Backup Your Data
            </a>
            <div class="flex items-center" v-if="isConnected">
              <div
                class="text-xs flex items-center text-green-500 uppercase tracking-wide"
              >
                <svg
                  class="h-2 w-2 fill-green-500"
                  viewBox="0 0 6 6"
                  aria-hidden="true"
                >
                  <circle cx="3" cy="3" r="3" />
                </svg>
                <p class="ml-1">Connected</p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between w-full">
            <h3 class="text-base font-semibold leading-6 text-gray-900">
              Your Flashcards
            </h3>
            <div class="ml-4 flex-shrink-0">
              <button
                v-if="hasFlashcards"
                @click="attemptToOpenCreationModal()"
                type="button"
                class="relative inline-flex items-center rounded-md bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <PlusIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
          <p class="mt-1 text-sm text-gray-500">
            You can keep the app running in the background. Questions are asked
            randomly from time to time. The more answers you get right on the
            automated pop-ups, the longer the interval before you're asked
            again.
          </p>
        </div>
      </div>
    </div>

    <div v-if="hasFlashcards">
      <ul
        role="list"
        class="divide-y divide-gray-100 overflow-scroll border border-t-0"
        style="max-height: 432px"
      >
        <li
          v-for="flashcard in flashcards"
          :key="flashcard.id"
          class="flex items-start justify-between gap-x-6 py-5 px-4 hover:bg-gray-50 cursor-pointer"
          id="flashcard-menu-item"
          @click="attemptToOpenViewModal($event, flashcard)"
        >
          <div class="min-w-0 w-full">
            <div class="flex items-start justify-between w-full gap-x-3">
              <p class="text-sm font-semibold leading-6 text-gray-900">
                {{ flashcard.question }}
              </p>

              <div class="flex flex-none items-center gap-x-4">
                <a
                  id="answer-btn"
                  href="#"
                  @click="attemptToOpenAnswerModal(flashcard)"
                  class="rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
                >
                  Answer <span class="sr-only">, {{ flashcard.question }}</span>
                </a>
                <Menu as="div" class="relative flex-none">
                  <MenuButton
                    id="menu-dots"
                    class="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900"
                  >
                    <span class="sr-only">Open options</span>
                    <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
                  </MenuButton>
                  <transition
                    enter-active-class="transition ease-out duration-100"
                    enter-from-class="transform opacity-0 scale-95"
                    enter-to-class="transform opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-75"
                    leave-from-class="transform opacity-100 scale-100"
                    leave-to-class="transform opacity-0 scale-95"
                  >
                    <MenuItems
                      class="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
                    >
                      <MenuItem v-slot="{ active }">
                        <a
                          href="#"
                          @click.prevent="
                            attemptToOpenViewModal($event, flashcard)
                          "
                          :class="[
                            active ? 'bg-gray-50' : '',
                            'block px-3 py-1 text-sm leading-6 text-gray-900',
                          ]"
                        >
                          View
                          <span class="sr-only"
                            >, {{ flashcard.question }}</span
                          >
                        </a>
                      </MenuItem>
                      <MenuItem id="delete-menu-item" v-slot="{ active }">
                        <a
                          href="#"
                          @click.prevent="attemptToOpenDeletionModal(flashcard)"
                          :class="[
                            active ? 'bg-gray-50' : '',
                            'block px-3 py-1 text-sm leading-6 text-red-600',
                          ]"
                        >
                          Delete
                          <span class="sr-only"
                            >, {{ flashcard.question }}</span
                          >
                        </a>
                      </MenuItem>
                    </MenuItems>
                  </transition>
                </Menu>
              </div>
            </div>
            <div
              class="mt-1 flex flex-col gap-x-2 text-xs leading-5 text-gray-500"
            >
              <p>
                Success rate {{ getSuccessRate(flashcard) }}% out of
                {{ flashcard.stats.timesAnswered }} answers.
              </p>
              <p class="truncate">
                Created at
                {{ time(flashcard.createdAt) }}
              </p>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div class="text-center my-12" v-else>
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vector-effect="non-scaling-stroke"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-semibold text-gray-900">No flashcards</h3>
      <p class="mt-1 text-sm text-gray-500">
        Get started by creating a new flashcard.
      </p>
      <div class="mt-6">
        <button
          @click="attemptToOpenCreationModal()"
          type="button"
          class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          New Flashcard
        </button>
      </div>
    </div>

    <!-- FLASHCARD CREATION MODAL START -->
    <TransitionRoot as="template" :show="openCreationModal">
      <Dialog
        as="div"
        class="relative z-10"
        @close="attemptToCloseCreationModal()"
      >
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />
        </TransitionChild>

        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div
            class="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0"
          >
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-full max-w-sm sm:p-6"
              >
                <div>
                  <div class="text-left">
                    <DialogTitle
                      as="h3"
                      class="text-base font-semibold leading-6 text-gray-900"
                    >
                      New Flashcard
                    </DialogTitle>
                    <div class="mt-2 text-left">
                      <div class="isolate -space-y-px rounded-md shadow-sm">
                        <div
                          class="relative rounded-md rounded-b-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600"
                        >
                          <label
                            for="question"
                            class="block text-xs font-medium text-gray-900"
                          >
                            Question
                          </label>
                          <input
                            @keydown.enter="addNewFlashcard()"
                            v-model="flashcard.question"
                            type="text"
                            name="question"
                            id="question"
                            class="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="What you should remember?"
                          />
                        </div>
                        <div
                          class="relative rounded-none rounded-t-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600"
                        >
                          <label
                            for="answer"
                            class="block text-xs font-medium text-gray-900"
                          >
                            Answer
                          </label>
                          <input
                            @keydown.enter="addNewFlashcard()"
                            v-model="flashcard.answer"
                            :type="showAnswers ? 'text' : 'password'"
                            name="answer"
                            id="answer"
                            class="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="What's the correct answer?"
                          />
                        </div>
                        <div
                          class="relative rounded-md rounded-t-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600"
                        >
                          <label
                            for="answer"
                            class="block text-xs font-medium text-gray-900"
                          >
                            Confirmation
                          </label>
                          <input
                            @keydown.enter="addNewFlashcard()"
                            v-model="flashcard.confirmation"
                            :type="showAnswers ? 'text' : 'password'"
                            name="confirmation"
                            id="confirmation"
                            class="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="Type the answer again"
                          />
                        </div>
                        <a
                          href="#"
                          class="text-gray-700 underline tracking-wide text-xs hover:font-semibold"
                          @click.prevent="showHideAnswers()"
                        >
                          {{ showAnswers ? `Hide answers` : `Show answers` }}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-5 sm:mt-6 text-center">
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    :class="{ 'opacity-50 cursor-not-allowed': !allGood }"
                    @click="addNewFlashcard()"
                  >
                    Create
                  </button>
                  <p v-if="!answersMatch" class="mt-2 text-xs text-gray-500">
                    "Answer" and "Confirmation" should match
                  </p>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
    <!-- FLASHCARD CREATION MODAL END -->

    <!-- FLASHCARD ANSWER MODAL START -->
    <TransitionRoot as="template" :show="openAnswerModal">
      <Dialog
        as="div"
        class="relative z-10"
        @close="attemptToCloseAnswerModal()"
      >
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />
        </TransitionChild>

        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div
            class="flex min-h-full items-center justify-center p-4 text-center sm:p-0"
          >
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                id="ani-test"
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-full max-w-sm sm:p-6"
              >
                <div>
                  <div class="text-left">
                    <DialogTitle
                      as="h3"
                      class="text-base font-semibold leading-6 text-gray-900"
                    >
                      Question
                    </DialogTitle>
                    <div class="text-left">
                      <p class="mb-4 text-gray-600">
                        {{ activeFlashcard.question }}
                      </p>

                      <div
                        class="relative rounded-md px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600"
                      >
                        <label
                          for="answer"
                          class="block text-xs font-medium text-gray-900"
                        >
                          Your Answer
                        </label>
                        <input
                          @keydown.enter="checkAnswer(activeFlashcard)"
                          v-model="activeFlashcard.userInput"
                          :type="
                            activeFlashcard.showAnswer ? 'text' : 'password'
                          "
                          name="answer"
                          id="answer"
                          class="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          placeholder="What's the correct answer?"
                        />
                      </div>
                      <a
                        v-if="activeFlashcard.userInput.length"
                        href="#"
                        class="text-gray-700 underline tracking-wide text-xs hover:font-semibold"
                        @click.prevent="
                          activeFlashcard.showAnswer =
                            !activeFlashcard.showAnswer
                        "
                      >
                        {{
                          activeFlashcard.showAnswer
                            ? `Hide your answer`
                            : `Show your answer`
                        }}
                      </a>
                    </div>
                  </div>
                </div>
                <div class="mt-5 sm:mt-6 text-center">
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    :class="{
                      'opacity-50 cursor-not-allowed':
                        activeFlashcard.userInput.length < 1,
                    }"
                    @click="checkAnswer(activeFlashcard)"
                  >
                    Check Your Answer
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
    <!-- FLASHCARD ANSWER MODAL END -->

    <!-- CORRECT ANSWER ALERT START -->
    <div
      aria-live="assertive"
      class="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-20"
    >
      <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
        <transition
          enter-active-class="transform ease-out duration-300 transition"
          enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
          leave-active-class="transition ease-in duration-100"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="successAlert.show"
            class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
          >
            <div class="rounded-md bg-green-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <CheckCircleIcon
                    class="h-5 w-5 text-green-400"
                    aria-hidden="true"
                  />
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">
                    {{ successAlert.text }}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <!-- CORRECT ANSWER ALERT END -->

    <!-- WRONG ANSWER ALERT START -->
    <div
      aria-live="assertive"
      class="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-20"
    >
      <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
        <transition
          enter-active-class="transform ease-out duration-300 transition"
          enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
          leave-active-class="transition ease-in duration-100"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showWrongAnswerAlert"
            class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
          >
            <div class="rounded-md bg-red-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <XCircleIcon
                    class="h-5 w-5 text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">
                    Your answer was wrong!
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <!-- WRONG ANSWER ALERT END -->

    <!-- VIEW MODAL START -->
    <TransitionRoot as="template" :show="openViewModal">
      <Dialog as="div" class="relative z-10" @close="attemptToCloseViewModal()">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />
        </TransitionChild>

        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div
            class="flex min-h-full items-center justify-center p-0 text-center"
          >
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all my-8 w-full max-w-lg"
              >
                <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="relative flex items-center justify-between">
                    <div class="flex flex-col">
                      <DialogTitle
                        as="h3"
                        class="text-xl font-semibold leading-6 text-gray-900 mb-4"
                      >
                        Your Answers
                      </DialogTitle>
                      <p class="mb-2 text-gray-600 text-sm">
                        {{
                          `Answered ${activeFlashcard.stats.timesAnswered} times. You got it ${activeFlashcard.stats.timesWrong} times wrong, and ${activeFlashcard.stats.timesCorrect} times correct`
                        }}
                      </p>
                    </div>

                    <div class="absolute right-0 top-0 block">
                      <button
                        type="button"
                        class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        @click="attemptToCloseViewModal()"
                      >
                        <span class="sr-only">Close</span>
                        <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div v-if="!activeFlashcard.answers.length" class="my-24">
                    <div class="text-center">
                      <h3 class="mt-2 text-sm font-semibold text-gray-900">
                        No answers
                      </h3>
                      <p class="mt-1 text-sm text-gray-500">
                        You have not yet answered to "{{
                          activeFlashcard.question
                        }}" question.
                      </p>
                      <div class="mt-6">
                        <button
                          @click="addFirstAnswerButtonOnClick(activeFlashcard)"
                          type="button"
                          class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          <PlusIcon
                            class="-ml-0.5 mr-1.5 h-5 w-5"
                            aria-hidden="true"
                          />
                          Add answer
                        </button>
                      </div>
                    </div>
                  </div>
                  <ul
                    role="list"
                    class="divide-y divide-gray-100 overflow-scroll"
                    style="max-height: 300px"
                    v-if="activeFlashcard.answers.length"
                  >
                    <li
                      v-for="answer in activeFlashcard.answers"
                      :key="answer.id"
                      class="flex items-center justify-between gap-x-6 p-5"
                      :class="{
                        'bg-red-50': !answer.correct,
                        'bg-green-0': answer.correct,
                      }"
                    >
                      <div class="min-w-0 w-full">
                        <div class="flex items-start justify-between gap-x-3">
                          <div class="flex items-center">
                            <div
                              class="flex-shrink-0 mr-2"
                              v-if="!answer.correct"
                            >
                              <XCircleIcon
                                class="h-5 w-5 text-red-400"
                                aria-hidden="true"
                              />
                            </div>

                            <div
                              class="flex-shrink-0 mr-2"
                              v-if="answer.correct"
                            >
                              <CheckCircleIcon
                                class="h-5 w-5 text-green-400"
                                aria-hidden="true"
                              />
                            </div>
                            <p
                              class="text-sm font-semibold leading-6 text-gray-900"
                            >
                              {{ activeFlashcard.question }}
                            </p>
                          </div>
                          <p
                            :class="[
                              statuses[answer.correct],
                              'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                            ]"
                          >
                            {{ answer.correct ? "Correct" : "Wrong" }}
                          </p>
                        </div>
                        <div
                          class="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500"
                        >
                          <p class="whitespace-nowrap">
                            Answered at
                            <time :datetime="answer.createdAt">
                              {{ time(answer.createdAt) }} -
                              {{ timeAgo(answer.createdAt) }}
                            </time>
                          </p>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div
                  class="bg-gray-50 px-4 py-3 flex items-end justify-end px-6"
                >
                  <button
                    v-if="activeFlashcard.answers.length"
                    type="button"
                    class="mr-6 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="addFirstAnswerButtonOnClick(activeFlashcard)"
                  >
                    Answer
                  </button>
                  <button
                    type="button"
                    class="mt-3 inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 mt-0 w-auto"
                    @click="attemptToCloseViewModal()"
                    ref="cancelButtonRef"
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
    <!-- VIEW MODAL END -->

    <!-- DELETION MODAL START -->
    <TransitionRoot as="template" :show="openDeletionModal">
      <Dialog
        as="div"
        class="relative z-10"
        @close="attemptToCloseDeletionModal()"
      >
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />
        </TransitionChild>

        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div
            class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
          >
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
              >
                <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <div
                      class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                    >
                      <ExclamationTriangleIcon
                        class="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <DialogTitle
                        as="h3"
                        class="text-base font-semibold leading-6 text-gray-900"
                      >
                        Delete Flashcard
                      </DialogTitle>
                      <div class="mt-2">
                        <p class="text-sm text-gray-500">
                          Are you sure you want to delete "{{
                            activeFlashcard.question
                          }}" flashcard?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
                >
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    @click="deleteFlashcard(activeFlashcard)"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    @click="attemptToCloseDeletionModal()"
                    ref="cancelButtonRef"
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
    <!-- DELETION MODAL END -->

    <!-- BACKUP MODAL START -->
    <TransitionRoot as="template" :show="openBackupModal">
      <Dialog
        as="div"
        class="relative z-10"
        @close="attemptToCloseBackupModal()"
      >
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />
        </TransitionChild>

        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div
            class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
          >
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
              >
                <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <div
                      class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10"
                    >
                      <CloudArrowUpIcon
                        class="h-6 w-6 text-indigo-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <DialogTitle
                        as="h3"
                        class="text-base font-semibold leading-6 text-gray-900"
                      >
                        Backup Your Data
                      </DialogTitle>
                      <div class="mt-2">
                        <p class="text-sm text-gray-500">
                          By replicating your data with a remote peer, the peer
                          serves only as a host to improve data availability.
                          <b>
                            The remote peer <i><u>cannot</u></i> view your data;
                          </b>
                          only the private key holder (YOU), can access it.
                        </p>
                      </div>
                    </div>

                    <div class="mt-2 text-left">
                      <div class="isolate -space-y-px rounded-md shadow-sm">
                        <div
                          class="relative rounded-md px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600"
                        >
                          <label
                            for="question"
                            class="block text-xs font-medium text-gray-900"
                          >
                            Remote Public Key
                          </label>
                          <input
                            :disabled="isConnected"
                            @keydown.enter="saveAndConnect()"
                            v-model="backup.pubkey"
                            type="text"
                            name="question"
                            id="question"
                            class="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="d9c93....."
                          />
                        </div>
                        <p
                          v-if="isConnected"
                          class="text-xs text-gray-700 pt-1"
                        >
                          You're connected. Disconnect from the current remote
                          peer in order to change the key.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
                >
                  <button
                    v-if="isConnected"
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    @click="disconnect()"
                  >
                    Disconnect
                  </button>
                  <button
                    v-if="!isConnected"
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                    @click="saveAndConnect()"
                  >
                    Save & Connect
                  </button>
                  <button
                    type="button"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    @click="attemptToCloseBackupModal()"
                    ref="cancelButtonRef"
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
    <!-- BACKUP MODAL END -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { format, utcToZonedTime } from "date-fns-tz";
import { formatDistanceToNow } from "date-fns";
import { useFlashcardStore } from "../stores/flashcards";

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import {
  PlusIcon,
  EllipsisVerticalIcon,
  XCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/vue/20/solid";
import {
  CheckIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
} from "@heroicons/vue/24/outline";

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
function time(time, f = "yyyy-MM-dd HH:mm") {
  return format(utcToZonedTime(time, userTimezone), f);
}
function timeAgo(date) {
  return formatDistanceToNow(date, { addSuffix: true });
}
async function closeAllModals() {
  return new Promise((resolve) => {
    openCreationModal.value = false;
    openAnswerModal.value = false;
    openViewModal.value = false;
    openDeletionModal.value = false;
    openBackupModal.value = false;

    setTimeout(() => {
      resolve(true);
    }, 250);
  });
}
function getSuccessRate(flashcard) {
  const { stats } = flashcard;
  if (!stats.timesAnswered) {
    return 0;
  }
  return Number((stats.timesCorrect / stats.timesAnswered) * 100).toFixed(2);
}
const { ipcRenderer } = window;
const store = useFlashcardStore();
const pageLoaded = ref(false);
const openCreationModal = ref(false);
const showAnswers = ref(false);
const defFlashcard = {
  question: "",
  answer: "",
  confirmation: "",
};
const flashcard = ref({ ...defFlashcard });

// @TODO: Make user store
const settings = ref({});
onMounted(async () => {
  pageLoaded.value = false;
  await store.getFlashcards();
  await loadSettings();
  pageLoaded.value = true;
});

async function loadSettings() {
  try {
    const response = await ipcRenderer.invoke("user/get");
    settings.value = response.settings || {};
    backupService.value = response.backupService || defaultBackupService;
  } catch (error) {
    //
  }
}

const isConnected = computed(
  () => backupService.value.replicated || backupService.value.connected
);
const flashcards = computed(() => store.flashcards);
const hasFlashcards = computed(() => store.hasFlashcards);
const answersMatch = computed(() => {
  return flashcard.value.answer === flashcard.value.confirmation;
});
const allGood = computed(() => {
  return answersMatch.value && String(flashcard.value.answer).length > 0;
});

const flashcardDeletionInProgress = ref(false);
async function deleteFlashcard(flashcard) {
  if (flashcardDeletionInProgress.value) {
    return;
  }

  flashcardDeletionInProgress.value = true;
  const { id } = flashcard;
  await store.deleteFlashcard(id);
  flashcardDeletionInProgress.value = false;

  attemptToCloseDeletionModal();
}

const newFlashcardInProgress = ref(false);
async function addNewFlashcard() {
  if (!allGood.value || newFlashcardInProgress.value) {
    return;
  }

  newFlashcardInProgress.value = true;
  const { question, answer, confirmation } = flashcard.value;
  await store.addFlashcard({ question, answer, confirmation });
  newFlashcardInProgress.value = false;

  attemptToCloseCreationModal();
}

function showHideAnswers() {
  showAnswers.value = !showAnswers.value;
}

function attemptToOpenCreationModal() {
  openCreationModal.value = true;
}

function attemptToCloseCreationModal() {
  openCreationModal.value = false;
  setTimeout(() => {
    flashcard.value = { ...defFlashcard };
  }, 250);
}

const defActiveFlashcard = { question: "", userInput: "", showAnswer: false };
const activeFlashcard = ref(defActiveFlashcard);
const openAnswerModal = ref(false);
const answerCheckInProgress = ref(false);

const successAlertDefaultState = {
  show: false,
  text: "",
};
const successAlert = ref({ ...successAlertDefaultState });
function triggerSuccessAlert(msg) {
  if (!msg) return;

  successAlert.value = {
    show: true,
    text: msg,
  };
  setTimeout(() => {
    successAlert.value = successAlertDefaultState;
  }, 3500);
}

const showWrongAnswerAlert = ref(false);
function attemptToCloseAnswerModal() {
  openAnswerModal.value = false;
  queueInProgress.value = false;
  setTimeout(() => {
    activeFlashcard.value = defActiveFlashcard;
  }, 250);
}
function attemptToOpenAnswerModal(flashcard) {
  activeFlashcard.value = {
    id: flashcard.id,
    question: flashcard.question,
    triggerType: flashcard.triggerType || "manual",
    userInput: "",
  };
  openAnswerModal.value = true;
}
function addFirstAnswerButtonOnClick(flashcard) {
  attemptToCloseViewModal();
  setTimeout(() => {
    attemptToOpenAnswerModal(flashcard);
  }, 250);
}
async function checkAnswer(flashcard) {
  const { id, userInput, triggerType } = flashcard;

  if (userInput.length < 1 || answerCheckInProgress.value) return;

  answerCheckInProgress.value = true;
  const response = await store.checkAnswer(id, { userInput, triggerType });
  await store.getFlashcards();
  answerCheckInProgress.value = false;

  if (triggerType === "automatic") {
    flashcardsQueue.value = flashcardsQueue.value.filter((fc) => fc.id !== id);
    queueInProgress.value = false;
  }

  // Handle correct answers
  if (response && response.correctAnswer) {
    // Trigger the confetti explosion
    createConfetti();

    triggerSuccessAlert("Congrats! Your answer was correct!");
    showWrongAnswerAlert.value = false;
    activeFlashcard.value = defActiveFlashcard;
    openAnswerModal.value = false;
  }

  // Handle wrong answers
  if (response && !response.correctAnswer) {
    const element = document.getElementById("ani-test");
    if (element) {
      element.classList.add("shake-animation");
      setTimeout(() => {
        element.classList.remove("shake-animation");
      }, 750);
    }

    showWrongAnswerAlert.value = true;
    activeFlashcard.value.userInput = "";
    setTimeout(() => {
      showWrongAnswerAlert.value = false;
    }, 3500);
  }
}

function hasParentWithId(element, ids) {
  while (element) {
    if (ids.includes(element.id)) {
      return true;
    }
    element = element.parentElement;
  }
  return false;
}

const statuses = {
  true: "text-green-700 bg-green-50 ring-green-600/20",
  false: "text-red-800 bg-red-50 ring-red-600/20",
};
const openViewModal = ref(false);
async function attemptToOpenViewModal(event, flashcard) {
  const ids = ["menu-dots", "answer-btn", "delete-menu-item"];
  const ignore = ["delete-menu-item"];
  if (hasParentWithId(event.target, ids) || ignore.includes(event.target.id)) {
    return;
  }

  const { answers } = await store.getAnswers(flashcard.id);
  activeFlashcard.value = {
    id: flashcard.id,
    stats: flashcard.stats,
    question: flashcard.question,
    answers,
  };
  openViewModal.value = true;
}
function attemptToCloseViewModal() {
  openViewModal.value = false;
  setTimeout(() => {
    activeFlashcard.value = defActiveFlashcard;
  }, 250);
}

const openDeletionModal = ref(false);
function attemptToOpenDeletionModal(flashcard) {
  activeFlashcard.value = {
    id: flashcard.id,
    question: flashcard.question,
  };
  openDeletionModal.value = true;
}
function attemptToCloseDeletionModal() {
  openDeletionModal.value = false;
  setTimeout(() => {
    activeFlashcard.value = defActiveFlashcard;
  }, 250);
}

const backup = ref({});
const openBackupModal = ref(false);
function attemptToOpenBackupModal() {
  openBackupModal.value = true;
  backup.value.pubkey = settings.value.backup_pub_key;
}
function attemptToCloseBackupModal() {
  openBackupModal.value = false;
}
async function disconnect() {
  const response = await ipcRenderer.invoke("cloud/disconnect");

  if (response.success) {
    await loadSettings();
    backupService.value = defaultBackupService;
    triggerSuccessAlert("You're disconnected");
    attemptToCloseBackupModal();
  }
}
async function saveAndConnect() {
  if (!backup.value.pubkey) return;

  const response = await ipcRenderer.invoke("cloud/connect", {
    pubkey: backup.value.pubkey,
  });

  if (response.success) {
    triggerSuccessAlert("Saved");
    attemptToCloseBackupModal();
  }
}
const defaultBackupService = { connected: false, replicated: false };
const backupService = ref({ ...defaultBackupService });
ipcRenderer.on("cloud:connected", (event, payload) => {
  backupService.value.connected = payload.success;
});
ipcRenderer.on("db:replicated", async (event, payload) => {
  backupService.value.replicated = payload.success;
});
ipcRenderer.on("db:replicated:append", async () => {
  setTimeout(async () => {
    await store.getFlashcards();
  }, 250);
});

const flashcardsQueue = ref([]);
const queueInProgress = ref(false);
async function handleFlashcards(flashcards) {
  const next = flashcards[0];

  await closeAllModals();
  queueInProgress.value = true;
  next.triggerType = "automatic";
  attemptToOpenAnswerModal(next);
}
ipcRenderer.on("flashcards-in-queue", async (_, payload) => {
  if (queueInProgress.value) return;

  flashcardsQueue.value = payload;
  if (flashcardsQueue.value.length && !queueInProgress.value) {
    handleFlashcards([...flashcardsQueue.value]);
  }
});

function createConfetti() {
  const confettiCount = 150;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.backgroundColor = getRandomColor();
    document.body.appendChild(confetti);

    // Calculate random trajectory
    const x = (Math.random() - 0.5) * 6000; // X-axis spread
    const y = (Math.random() - 0.5) * 6000; // Y-axis spread
    confetti.style.setProperty("--x", `${x}%`);
    confetti.style.setProperty("--y", `${y}%`);

    // Trigger the animation
    setTimeout(() => confetti.classList.add("animate"), 10);
    setTimeout(() => confetti.remove(), 1010); // Cleanup after animation
  }
}

function getRandomColor() {
  const colors = ["#f00", "#0f0", "#00f", "#ff0", "#f0f", "#0ff"];
  return colors[Math.floor(Math.random() * colors.length)];
}
</script>

<style>
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-15px);
  }
  75% {
    transform: translateX(15px);
  }
}

.shake-animation {
  animation: shake 0.15s ease-in-out infinite;
}

.confetti {
  position: fixed;
  width: 20px;
  height: 20px;
  background-color: #f00;
  opacity: 0;
  top: 50%;
  left: 50%;
  transform-style: preserve-3d;
  pointer-events: none;
}
.confetti.animate {
  animation: explode 0.8s ease-out forwards;
}

@keyframes explode {
  0% {
    transform: translate3D(-50%, -50%, 0);
    opacity: 1;
  }
  100% {
    transform: translate3D(var(--x), var(--y), 0);
    opacity: 0;
  }
}
</style>
