const messages = [
    // رسائل عربية عامة (4 رسائل)
    {
        ar: {
            text: "القرآن ليس كتاب صراع، بل رسالة حياة. نزل ليوقظ الضمير، ويهدي العقل، ويزرع الرحمة في قلب الإنسانية.",
            reference: null
        },
        en: {
            text: "The Qur’an is not a book of conflict, but a message of life. It was revealed to awaken conscience, guide the mind, and plant mercy in the heart of humanity.",
            reference: null
        }
    },
    {
        ar: {
            text: "هنا كلام الله. نورٌ يهدي، وعدلٌ يقيم، وسلامٌ يعانق كل قلب صادق.",
            reference: null
        },
        en: {
            text: "Here is the Word of God. A light that guides, a justice that establishes, and a peace that embraces every sincere heart.",
            reference: null
        }
    },
    {
        ar: {
            text: "القرآن دعوة لا إكراه. يخاطب العقل بالحجة، والقلب بالمحبة، والإنسان بكرامته.",
            reference: null
        },
        en: {
            text: "The Qur’an is an invitation, not a compulsion. It addresses the mind with proof, the heart with love, and the human with dignity.",
            reference: null
        }
    },
    {
        ar: {
            text: "من أساء للقرآن لم يفهمه. ومن قرأه بقلبٍ منصف، وجده طريقًا للسلام لا للكراهية.",
            reference: null
        },
        en: {
            text: "Whoever abuses the Qur’an has not understood it. Whoever reads it with an impartial heart will find it a path to peace, not hatred.",
            reference: null
        }
    },
    
    // رسائل الآيات القرآنية المضافة حديثًا (10 آيات)
    {
        ar: {
            text: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ",
            reference: "سورة الأنبياء، 107"
        },
        en: {
            text: "And We have not sent you, [O Muhammad], except as a mercy to the worlds.",
            reference: "سورة الأنبياء، 107"
        }
    },
    {
        ar: {
            text: "وَقُولُوا لِلنَّاسِ حُسْنًا",
            reference: "سورة البقرة، 83"
        },
        en: {
            text: "And speak to people good [words].",
            reference: "سورة البقرة، 83"
        }
    },
    {
        ar: {
            text: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ",
            reference: "سورة النحل، 90"
        },
        en: {
            text: "Indeed, Allah commands justice and good conduct.",
            reference: "سورة النحل، 90"
        }
    },
    {
        ar: {
            text: "وَلَا تَسْتَوِي الْحَسَنَةُ وَلَا السَّيِّئَةُ ۚ ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ",
            reference: "سورة فصلت، 34"
        },
        en: {
            text: "And not equal are the good deed and the bad. Repel [evil] by that [deed] which is better.",
            reference: "سورة فصلت، 34"
        }
    },
    {
        ar: {
            text: "يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا",
            reference: "سورة الحجرات، 13"
        },
        en: {
            text: "O mankind, indeed We have created you from male and female and made you peoples and tribes that you may know one another.",
            reference: "سورة الحجرات، 13"
        }
    },
    {
        ar: {
            text: "لَّا إِكْرَاهَ فِي الدِّينِ",
            reference: "سورة البقرة، 256"
        },
        en: {
            text: "There shall be no compulsion in [acceptance of] the religion.",
            reference: "سورة البقرة، 256"
        }
    },
    {
        ar: {
            text: "وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ",
            reference: "سورة القلم، 4"
        },
        en: {
            text: "And indeed, you are of a great moral character.",
            reference: "سورة القلم، 4"
        }
    },
    {
        ar: {
            text: "فَبِمَا رَحْمَةٍ مِّنَ اللَّهِ لِنتَ لَهُمْ ۖ وَلَوْ كُنتَ فَظًّا غَلِيظَ الْقَلْبِ لَانفَضُّوا مِنْ حَوْلِكَ",
            reference: "سورة آل عمران، 159"
        },
        en: {
            text: "So by mercy from Allah, you were lenient with them. And if you had been rude [in speech] and harsh in heart, they would have disbanded from about you.",
            reference: "سورة آل عمران، 159"
        }
    },
    {
        ar: {
            text: "مَنْ قَتَلَ نَفْسًا بِغَيْرِ نَفْسٍ أَوْ فَسَادٍ فِي الْأَرْضِ فَكَأَنَّمَا قَتَلَ النَّاسَ جَمِيعًا",
            reference: "سورة المائدة، 32"
        },
        en: {
            text: "Whoever kills a soul unless for a soul or for corruption [done] in the land - it is as if he had slain mankind entirely.",
            reference: "سورة المائدة، 32"
        }
    },
    {
        ar: {
            text: "هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ",
            reference: "سورة الرحمن، 60"
        },
        en: {
            text: "Is the reward for good [anything] but good?",
            reference: "سورة الرحمن، 60"
        }
    },
    
    // رسائل احترام الأديان (2 رسالة)
    {
        ar: {
            text: "احترام الأديان ليس مجاملة… بل مبدأ إنساني. فالإيمان حين يُهان، تُهان القيم المشتركة بين البشر.",
            reference: null
        },
        en: {
            text: "Respect for religions is not courtesy… but a human principle. When faith is insulted, the shared values among humans are insulted.",
            reference: null
        }
    },
    {
        ar: {
            text: "نختلف في المعتقد، ونتفق في الإنسانية. والقرآن يدعونا إلى التعارف لا التصادم.",
            reference: "القرآن 49:13"
        },
        en: {
            text: "We differ in belief, but agree on humanity. The Qur’an calls us to mutual acquaintance, not conflict.",
            reference: "Qur’an 49:13"
        }
    },
    
    // رسائل نور وهداية (2 رسالة)
    {
        ar: {
            text: "القرآن نورٌ لا ينطفئ. كلما أُريد له الإطفاء، ازداد إشراقًا في قلوب الباحثين عن الحق.",
            reference: null
        },
        en: {
            text: "The Qur’an is a light that never fades. The more they try to extinguish it, the brighter it shines in the hearts of those seeking truth.",
            reference: null
        }
    },
    {
        ar: {
            text: "هو كتاب هداية لا كراهية، ومنبع أخلاق لا عنف، ورسالة حب لا عداء.",
            reference: "القرآن 41:34"
        },
        en: {
            text: "It is a book of guidance, not hatred, a source of ethics, not violence, and a message of love, not enmity.",
            reference: "Qur’an 41:34"
        }
    },
    
    // رسائل أخلاقية قوية (للإعلام والنخب) (3 رسائل)
    {
        ar: {
            text: "إلى الإعلام والنخب وصنّاع الرأي: حرية التعبير لا تكون بإهانة المقدسات، ولا يُبنى السلام على استفزاز عقائد الشعوب.",
            reference: "القرآن 16:90"
        },
        en: {
            text: "To Media and Elites: Freedom of expression is not achieved by insulting the sacred, nor is peace built upon provoking the beliefs of nations.",
            reference: "Qur’an 16:90"
        }
    },
    {
        ar: {
            text: "حين يُهان القرآن، لا يُهان المسلم وحده، بل تُجرح قيم التعايش، ويُختبر ضمير العالم. الكلمة مسؤولية، والاحترام واجب أخلاقي قبل أن يكون قانونيًا.",
            reference: null
        },
        en: {
            text: "When the Qur’an is insulted, it is not only the Muslim who is insulted, but the values of coexistence are wounded, and the world's conscience is tested. The word is a responsibility, and respect is a moral duty before it is a legal one.",
            reference: null
        }
    },
    {
        ar: {
            text: "النقد حق… والإساءة سقوط أخلاقي. والتمييز بينهما هو ما يصنع حضارة أو يهدمها.",
            reference: null
        },
        en: {
            text: "Critique is a right… and abuse is a moral failure. The distinction between them is what builds or destroys a civilization.",
            reference: null
        }
    },
    
    // رسائل إنجليزية راقية إضافية (4 رسائل)
    {
        ar: {
            text: "القرآن ليس تهديدًا. إنه دعوة للعدل والرحمة والتفاهم.",
            reference: "القرآن 16:90"
        },
        en: {
            text: "The Qur’an is not a threat. It is an invitation — to justice, mercy, and understanding.",
            reference: "Qur’an 16:90"
        }
    },
    {
        ar: {
            text: "القرآن يتحدث إلى القلب البشري قبل أن يتحدث إلى العقيدة.",
            reference: "القرآن 49:13"
        },
        en: {
            text: "The Qur’an speaks to the human heart before it speaks to belief.",
            reference: "Qur’an 49:13"
        }
    },
    {
        ar: {
            text: "احترام القرآن هو احترام لقدسية الإيمان ذاته.",
            reference: "القرآن 6:108"
        },
        en: {
            text: "Respecting the Qur’an is respecting the sacredness of faith itself.",
            reference: "القرآن 6:108"
        }
    },
    {
        ar: {
            text: "حرق كتاب لا يهزم فكرة أبدًا. الفهم هو الجواب الوحيد.",
            reference: "القرآن 39:18"
        },
        en: {
            text: "Burning a book never defeats an idea. Understanding is the only answer.",
            reference: "القرآن 39:18"
        }
    },
    
    // رسالة ختامية (1 رسالة)
    {
        ar: {
            text: "هذا الموقع رسالة، لا ردّة فعل. نعرّف بالقرآن كما هو: نورًا، هدايةً، وعدلًا، ورحمةً للعالمين.",
            reference: null
        },
        en: {
            text: "This website is a message, not a reaction. We present the Qur’an as it is: a light, a guidance, a justice, and a mercy to all worlds.",
            reference: null
        }
    }
];

export default messages;
