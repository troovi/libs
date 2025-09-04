// import { Condition, Context } from 'chezit'

// import { Container, Double, Splitter, Label } from 'formkit/layouts'

// import { emailRegExp } from 'utilities'
// import {
//   WeekDaysForm,
//   DateInput,
//   NumberInput,
//   FileInput,
//   SelectForm,
//   TextInput,
//   OptionBuilderForm,
//   AutoselectForm,
//   OptionBuilderAnswerForm,
//   CheckboxForm,
//   ColorForm,
//   ImageUploaderAnswerForm,
//   ImageUploaderForm,
//   MessageForm,
//   MulticheckForm,
//   MultifileForm,
//   TimeForm,
//   PeriodForm,
//   RangeForm,
//   RatingForm,
//   ScoreForm,
//   StarsForm,
//   TagsInputForm,
//   StepperForm
// } from 'formkit/forms'

// type JOB_TYPES = 'HIRED' | 'FIRED' | 'UN_EMPLOYMENT'

// export const all_scheme = [
//   Label('Варианты')(
//     OptionBuilderForm('option-builder', {
//       range: {
//         min: 1,
//         max: 4
//       },
//       makeTitle: (i) => `Варик ${i}`,
//       makeValue: (i) => `value-${i}`,
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Ответы')(
//     OptionBuilderAnswerForm('option-answers', {
//       makeTitle: (i) => `Варик ${i}`,
//       makeValue: (i) => `value-${i}`,
//       oneAnswer: true,
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Контроль')(
//     CheckboxForm('privacy', {
//       text: 'Согласие с политикой конфиденциальности',
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Выберите цвет')(
//     ColorForm('color', {
//       palette: 'v2-role',
//       colors: ['blue', 'cyan', 'tea', 'green', 'yellow', 'orange', 'red', 'pink'],
//       columns: 8,
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Выбор нескольких вариантов')(
//     MulticheckForm()('multi-check', {
//       options: [
//         { title: 'Option 1', value: 'FIRED' },
//         { title: 'Option 2', value: 'HIRED' },
//         { title: 'Option 3', value: 'UN_EMPLOYMENT' }
//       ],
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Ответы на изображения')(
//     ImageUploaderAnswerForm('image-answers', {
//       createLink(filename) {
//         // @ts-ignore
//         return `${window.GLOBAL_ENV.FILE_API}/${filename}`
//       },
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Период')(
//     PeriodForm('period', {
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Список изображений')(
//     ImageUploaderForm('image-list', {
//       createLink(filename) {
//         // @ts-ignore
//         return `${window.GLOBAL_ENV.FILE_API}/${filename}`
//       },
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Поставьте оценку')(
//     RangeForm('range', {
//       maxValue: 4,
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Оцените')(
//     RatingForm('rating', {
//       options: [
//         {
//           title: 'Line A',
//           value: 'line-a'
//         },
//         {
//           title: 'Line B',
//           value: 'line-b'
//         }
//       ],
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Скор')(
//     ScoreForm('score', {
//       leftLabel: 'Nonono',
//       rightLabel: 'Yeeees!',
//       score: 8,
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Оцените обслуживание')(
//     StarsForm('stars', {
//       stars: 8,
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Шаги')(
//     StepperForm('stepper', {
//       min: 0,
//       max: 20,
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Теги')(
//     TagsInputForm('tags-input', {
//       placeholder: 'Выберите значения',
//       options: [
//         { title: 'Value 1', value: 'option-1' },
//         { title: 'Value 2', value: 'option-2' },
//         { title: 'Value 3', value: 'option-3' },
//         { title: 'Value 4', value: 'option-4' },
//         { title: 'Value 5', value: 'option-5' }
//       ],
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Файлы')(
//     MultifileForm('multi-file', {
//       createLink: (x) => x,
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Сообщение')(
//     MessageForm('message', {
//       placeholder: 'Напишите сообщение',
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Время')(
//     TimeForm('time', {
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Дни работы')(
//     WeekDaysForm('days', {
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   AutoselectForm('autoselect', {
//     data: {
//       options: ['text-1', 'text-2', 'text-3', 'text-4']
//     },
//     $rules: {
//       required: true
//     }
//   }),
//   Splitter()(),
//   Label('Cчет')(
//     TextInput('count', {
//       placeholder: 'Введите счет',
//       $rules: {}
//     })
//   ),
//   Label('Зарплата')(
//     NumberInput('salary', {
//       placeholder: 'Введите зарплату',
//       $rules: {
//         // required: true
//       }
//     })
//   ),
//   Label('Статус')(
//     SelectForm<JOB_TYPES | null>(null)('status', {
//       options: [
//         { title: 'Уволенный', value: 'FIRED' },
//         { title: 'Нанятый', value: 'HIRED' },
//         { title: 'Безработный', value: 'UN_EMPLOYMENT' }
//       ],
//       $rules: {
//         // required: true
//       }
//     })
//   ),
//   Condition('status', {
//     canActivate: (value: JOB_TYPES | null) => value === 'HIRED'
//   })(
//     Label('Место работы')(
//       NumberInput('job', {
//         placeholder: 'Введите название компании',
//         $rules: {
//           // required: true
//         }
//       })
//     )
//   ),
//   Container('Личные данные')(
//     Context('worker')(
//       Double()(
//         Label('Имя')(
//           TextInput('name', {
//             placeholder: ''
//           })
//         ),
//         Label('Фамилия')(
//           TextInput('surname', {
//             placeholder: ''
//           })
//         )
//       ),
//       Label('Отчество')(
//         TextInput('patronymic', {
//           placeholder: ''
//         })
//       ),
//       Label('Дата рождения')(
//         DateInput('birthday', {
//           $rules: {
//             // required: true,
//             validate: (value) => {
//               if (value.year > new Date().getFullYear() - 18) {
//                 throw 'Допускаются только совершенно летние'
//               }
//             }
//           }
//         })
//       ),
//       Label('Дата встуления')(DateInput('entry', {})),
//       Container('Контактные данные')(
//         Context('contacts')(
//           Label('Телефон')(
//             TextInput('phone', {
//               placeholder: ''
//             })
//           ),
//           Label('Почта')(
//             TextInput('mail', {
//               placeholder: 'Введите почту',
//               $rules: {
//                 // required: true,
//                 validate: (value) => {
//                   if (!emailRegExp.test(value)) {
//                     throw ''
//                   }
//                 }
//               }
//             })
//           ),
//           Context('geo')(
//             Label('Страна')(
//               TextInput('country', {
//                 placeholder: 'Введите название страны'
//               })
//             ),
//             Label('Город')(
//               TextInput('city', {
//                 placeholder: 'Введите название города'
//               })
//             ),
//             Context('place')(
//               Double()(
//                 Label('Улица')(
//                   TextInput('street', {
//                     placeholder: 'Укажите улицу'
//                   })
//                 ),
//                 Label('Дом')(
//                   NumberInput('house', {
//                     placeholder: 'Укажите дом',
//                     $rules: {
//                       // required: true
//                     }
//                   })
//                 )
//               )
//             )
//           ),
//           Label('Дополнительная почта')(
//             TextInput('extra_mail', {
//               placeholder: '',
//               $rules: {
//                 validate(value) {
//                   if (!emailRegExp.test(value)) {
//                     throw 'Не соответствует формату почты'
//                   }
//                 }
//               }
//             })
//           )
//         )
//       )
//     )
//   ),
//   Splitter()(),
//   NumberInput('ps', {
//     placeholder: 'P.S'
//   }),
//   Label('Прикрепите файл')(
//     FileInput('file', {
//       createLink(filename) {
//         return filename
//       }
//       // $rules: {
//       //   required: true
//       // }
//     })
//   ),
//   Splitter()()
// ]
