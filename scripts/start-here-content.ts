// The first "New to faith? Start here" pieces: plain-language, no church background assumed.
// A DRAFT for the pastors to review and edit. Nothing here is on the site until
// scripts/add-start-here-resources.ts is run, after the church has approved the wording.
//
// `check` lists what the church should confirm for each piece; it is for the review
// document only and is never published.

export type Block = { h: string } | { p: string } | { ul: string[] }

export type Piece = { title: string; tags: string[]; blocks: Block[]; check: string[] }

export const PIECES: Piece[] = [
  {
    title: 'Who is Jesus?',
    tags: ['jesus', 'who is jesus', 'beginners'],
    blocks: [
      {
        p: 'People have all sorts of ideas about Jesus. Here is what Christians believe about him, in plain words. You don’t have to agree with any of it to read on.',
      },
      { h: 'A real person in history' },
      {
        p: 'Jesus lived about 2,000 years ago in what is now Israel. He was a Jewish teacher who became known for healing sick people, welcoming those others turned away, and talking about God in a way ordinary people could understand. Ancient historians outside the Bible also mention him, and that he was executed by the Roman authorities.',
      },
      { h: 'Who Christians say he is' },
      {
        p: 'Christians believe Jesus is the Son of God: God coming among us as a human being, so that we could see what God is really like. That is why he is shown as loving, patient and completely truthful, all at once.',
      },
      { h: 'Why he died' },
      {
        p: 'Christians believe Jesus died on the cross on purpose. The Bible says that the wrong things we all do leave us cut off from God, and that this needed dealing with. Jesus took it on himself so that we can be forgiven and make a fresh start. One of the best-known verses says that God loved the world so much that he gave his only Son, so that everyone who trusts in him can have life that never ends (John 3:16).',
      },
      { h: 'Why it matters today' },
      {
        p: 'Christians believe that three days after he died, Jesus came back to life, and that he is alive now. This is the centre of the Christian faith. It means Jesus is not only someone to read about; he is someone you can know. He invited everyone who is tired and carrying heavy loads to come to him and find rest (Matthew 11:28).',
      },
      { h: 'Want to find out more?' },
      {
        ul: [
          'Read the Gospel of Mark in the Bible. It is short and fast-moving, and tells Jesus’s story from the beginning.',
          'Then try the Gospel of John, which explains who Jesus is and why he came.',
          'Ask us anything. No question is too basic.',
        ],
      },
    ],
    check: [
      'Confirm you are happy with how this describes why Jesus died and rose again, and add anything your church always includes (for example the Holy Spirit).',
      'The Bible verses are paraphrased. Replace them with quotes from the translation your church prefers if you wish.',
    ],
  },
  {
    title: 'What does it mean to be a Christian?',
    tags: ['christian', 'faith', 'forgiveness', 'beginners'],
    blocks: [
      {
        p: 'A Christian is someone who follows Jesus. It is not about being a good person, coming from a religious family, or knowing the Bible well. Here is what it means in practice.',
      },
      { h: 'It starts with what God has done' },
      {
        p: 'Christians believe God loves every person, and that nobody has to earn that love. The Bible says we have all fallen short of the way God made us to live. It calls this sin, which simply means the ways we go wrong and the ways we are cut off from God. Jesus made a way back.',
      },
      { h: 'It is a gift, not a reward' },
      {
        p: 'The Bible says we are saved by grace, through faith, and not by our own efforts (Ephesians 2:8–9). Grace means a gift we do not deserve. Faith means trusting Jesus and accepting what he has done for us. You cannot be good enough first, and you do not have to be.',
      },
      { h: 'What it looks like' },
      {
        ul: [
          'Telling God you are sorry for the things you have done wrong, and receiving his forgiveness.',
          'Trusting Jesus and deciding to follow him.',
          'Getting to know him by praying, reading the Bible and spending time with other Christians.',
          'Letting him change you, over time, one day at a time.',
        ],
      },
      { h: 'How to begin' },
      {
        p: 'There are no magic words. Christians usually describe it as talking to God honestly. If you would like to, you could say something like this:',
      },
      {
        p: '“God, thank you that you love me. I am sorry for the things I have done wrong. Thank you that Jesus died and rose again for me. I want to follow him. Please forgive me, and help me to start again. Amen.”',
      },
      {
        p: 'If you prayed that, or you would like to talk about it first, please tell us. We would love to help you with your next step.',
      },
    ],
    check: [
      'The sample prayer is a common, simple one. Replace it with your church’s usual wording if you have one.',
      'Confirm the description of sin and grace matches how your church teaches it.',
    ],
  },
  {
    title: 'How do I start reading the Bible?',
    tags: ['bible', 'reading', 'beginners'],
    blocks: [
      { p: 'The Bible can feel big and confusing, but you do not have to start on page one. Here is a simple way in.' },
      { h: 'What the Bible is' },
      {
        p: 'The Bible is a collection of 66 books, written over about 1,500 years by many different people. It has two main parts: the Old Testament, written before Jesus, and the New Testament, about Jesus and the first Christians. Christians believe it is God’s message to us.',
      },
      { h: 'Where to start' },
      {
        ul: [
          'Mark: a short, fast-moving account of Jesus’s life. A good first read.',
          'John: explains who Jesus is and why he came.',
          'Psalms: prayers and songs that put honest feelings into words. Good for a hard day.',
          'Proverbs: short, practical wisdom for everyday life.',
        ],
      },
      {
        p: 'It is best not to begin at the very start and read straight through, because many people get stuck in the middle. You can come back to the Old Testament later.',
      },
      { h: 'Which Bible should I use?' },
      {
        p: 'Choose a modern translation that you find easy to read. Free apps and websites, such as the YouVersion Bible app and Bible Gateway, let you read many translations and try them out. If you would like a printed Bible, ask us and we can suggest one.',
      },
      { h: 'A simple way to read' },
      {
        ul: [
          'Set aside ten minutes at a quiet time of day.',
          'Read a short passage, such as one chapter of Mark.',
          'Ask yourself: What does this say? What does it show me about God or Jesus? Is there anything I should do about it?',
          'Write down any questions and bring them to us.',
        ],
      },
      {
        p: 'It is fine not to understand everything. Nobody does. Reading with someone else, such as a friend or a homegroup, makes it much easier.',
      },
    ],
    check: [
      'Add the Bible translation your church recommends.',
      'If you can give out printed Bibles, or run a beginners’ Bible study, say so here.',
    ],
  },
  {
    title: 'What is prayer, and how do I pray?',
    tags: ['prayer', 'beginners'],
    blocks: [
      {
        p: 'Prayer is simply talking with God. You do not need special words, a special place or a church building. God is happy to hear from you, however you say it.',
      },
      { h: 'A simple way to start' },
      {
        ul: [
          'Thank: say thank you for something good in your life.',
          'Sorry: tell God about anything you regret.',
          'Ask: ask for what you need, for yourself and for other people.',
          'Listen: stay quiet for a minute. Some people sense peace, some think of a Bible verse, and some simply rest.',
        ],
      },
      { h: 'When and where' },
      {
        p: 'Anywhere and at any time: in bed, on the bus, on a walk. Eyes closed or open, sitting or kneeling, out loud or in your head. What matters is being honest.',
      },
      { h: 'A prayer Jesus taught' },
      {
        p: 'Jesus’s friends once asked him how to pray, and he gave them a short prayer that Christians still say today, often called the Lord’s Prayer (Matthew 6:9–13). It is a good pattern: it starts with God, then asks for daily needs, forgiveness and protection.',
      },
      { h: 'What if it feels awkward?' },
      {
        p: 'That is normal. Most people feel awkward at first. Keep it short and keep going. Christians describe God’s answers in different ways: a sense of peace, a verse that suddenly makes sense, a person who helps, a door that opens. Sometimes the answer is “not yet”. If you would like us to pray for you, we would be glad to.',
      },
    ],
    check: ['Check the description of how prayer is “answered” fits how your church speaks about it.'],
  },
  {
    title: 'What happens at a church service?',
    tags: ['church', 'visit', 'what to expect', 'beginners'],
    blocks: [
      {
        p: 'If you have never been to church, or it has been a long time, it helps to know what to expect. Here is a general picture. Our Plan Your Visit page has the times, directions and parking.',
      },
      { h: 'The shape of a service' },
      {
        ul: [
          'A welcome and any notices.',
          'Worship: a time of singing, usually led by a band or choir. You can sing along, or just listen.',
          'Prayer.',
          'An offering: people who wish to give do so. Visitors are never expected to give.',
          'A message: a talk based on the Bible, explained in everyday terms.',
          'A closing prayer, and a chance to chat afterwards.',
        ],
      },
      { h: 'What to wear' },
      { p: 'There is no dress code here. Come as you are, in whatever you feel comfortable.' },
      { h: 'What you do not have to do' },
      {
        ul: [
          'You do not have to sing, stand up or pray out loud if you would rather not.',
          'You will not be asked to speak or to share anything about yourself.',
          'You will not be pressured to join anything or to give.',
        ],
      },
      { h: 'Children' },
      {
        p: 'Children are welcome. We run classes for different age groups, so they can learn and play with friends their own age. The Children’s Ministry page has the details.',
      },
      { h: 'After the service' },
      {
        p: 'People often stay to chat afterwards. You are welcome to say hello, ask questions, or head off. If it is your first time, you can also fill in our short “Visited us? Say hello” form on the I’m New Here page, so we can say hello properly.',
      },
    ],
    check: [
      'Check the order of service matches a typical Sunday here, and add or remove items.',
      'Confirm that visitors are never pressured to give, join or speak.',
      'The dress code and children’s details are taken from the I’m New Here and Children’s Ministry pages; keep them in step.',
    ],
  },
  {
    title: 'Questions people often ask',
    tags: ['questions', 'doubts', 'beginners'],
    blocks: [
      {
        p: 'Here are honest answers to questions many people have before they take a first step. If yours is not here, please ask us.',
      },
      { h: 'I have doubts. Can I still come?' },
      {
        p: 'Yes. Almost every Christian has had doubts, and the Bible is full of people who asked hard questions. Honest questions are welcome here. You do not have to be sure about everything to take a first step.',
      },
      { h: 'Do I have to be good enough first?' },
      {
        p: 'No. Christians believe that nobody is good enough on their own, which is exactly why Jesus came. You can come as you are.',
      },
      { h: 'What if I have done things I am ashamed of?' },
      {
        p: 'Christians believe that God forgives, whatever someone has done, when they are truly sorry and trust Jesus. Many people find this the most freeing part of the faith.',
      },
      { h: 'Why does God allow suffering?' },
      {
        p: 'This is one of the hardest questions, and there is no quick answer. Christians believe God is never distant from our pain: Jesus himself suffered, and the Bible says God is close to people who are hurting. If you are going through something painful, we would be glad to listen and to pray with you.',
      },
      { h: 'Will I have to give up everything I enjoy?' },
      {
        p: 'Following Jesus is not about a list of rules. People who follow him find that some things change over time, usually as they come to want that change. It is a journey, and nobody expects you to sort everything out at once.',
      },
      { h: 'Do I have to give money?' },
      { p: 'No. Giving is always a personal choice, and visitors are never expected to give.' },
      { h: 'Where can I ask my own question?' },
      {
        p: 'Use the “Ask us a question” link at the bottom of this page. A real person will reply, and there is no pressure.',
      },
    ],
    check: [
      'Check every answer sounds like your church, especially on suffering and on what changes when someone follows Jesus.',
      'Add the questions your church is asked most often.',
      'Confirm who will reply to questions sent through the Contact form.',
    ],
  },
]
