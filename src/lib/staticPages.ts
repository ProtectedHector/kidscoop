export type StaticPageCopy = {
  title: string;
  intro: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
  contactTitle: string;
  contactBody: string;
  instagram: string;
  facebook: string;
};

const pages: Record<string, { about: StaticPageCopy; contact: StaticPageCopy }> = {
  es: {
    about: {
      title: 'Historias para despertar la curiosidad',
      intro: 'KidZcoop reúne cuentos, datos curiosos, canciones, dibujos para colorear y pequeños retos para que los niños descubran el mundo con ganas de seguir preguntando.',
      sections: [
        {
          title: 'Aprender también puede ser una aventura',
          body: 'Cada historia está pensada para leerse en voz alta, escucharse, comentarse y convertirse en juego. Queremos que una noticia, un animal, un lugar o una idea se transformen en una conversación bonita entre niños y adultos.',
        },
        {
          title: 'Un espacio para mentes inquietas',
          body: 'Publicamos contenido amable, visual y accesible para familias, profes y pequeños lectores. KidZcoop nace para acompañar esos ratos en los que una pregunta abre otra y una historia lleva a la siguiente.',
        },
      ],
      contactTitle: 'Síguenos y comparte tus ideas',
      contactBody: 'Nos encantan las sugerencias de temas, historias y sorpresas para futuras publicaciones.',
      instagram: 'Instagram',
      facebook: 'Facebook',
    },
    contact: {
      title: 'Hablemos',
      intro: '¿Tienes una idea para una historia, quieres colaborar o simplemente saludar? KidZcoop está en redes y escucha las propuestas de familias, profes y pequeños exploradores.',
      sections: [
        {
          title: 'Ideas para nuevas historias',
          body: 'Cuéntanos qué temas despiertan más curiosidad en casa o en clase: animales, ciencia, cultura, música, deportes, lugares increíbles o personajes inspiradores.',
        },
        {
          title: 'Colaboraciones y comunidad',
          body: 'Si tienes un proyecto educativo, una actividad familiar o una propuesta que encaje con KidZcoop, escríbenos por nuestras redes sociales.',
        },
      ],
      contactTitle: 'Canales de contacto',
      contactBody: 'Puedes contactar con KidZcoop desde Instagram o Facebook. Respondemos lo antes posible.',
      instagram: 'Instagram',
      facebook: 'Facebook',
    },
  },
  en: {
    about: {
      title: 'Stories that spark curiosity',
      intro: 'KidZcoop brings together stories, fun facts, songs, coloring pages, and small challenges so kids can discover the world and keep asking questions.',
      sections: [
        {
          title: 'Learning can feel like an adventure',
          body: 'Each story is made to be read aloud, listened to, talked about, and turned into play. We want a fact, animal, place, or idea to become a warm conversation between kids and grown-ups.',
        },
        {
          title: 'A place for curious minds',
          body: 'We publish friendly, visual, accessible content for families, teachers, and young readers. KidZcoop is here for those moments when one question opens another and one story leads to the next.',
        },
      ],
      contactTitle: 'Follow along and share ideas',
      contactBody: 'We love suggestions for future topics, stories, and surprises.',
      instagram: 'Instagram',
      facebook: 'Facebook',
    },
    contact: {
      title: 'Let us talk',
      intro: 'Have an idea for a story, want to collaborate, or just want to say hello? KidZcoop is on social media and welcomes ideas from families, teachers, and young explorers.',
      sections: [
        {
          title: 'Ideas for new stories',
          body: 'Tell us what sparks curiosity at home or in class: animals, science, culture, music, sports, amazing places, or inspiring people.',
        },
        {
          title: 'Collaborations and community',
          body: 'If you have an educational project, family activity, or proposal that fits KidZcoop, reach out through our social channels.',
        },
      ],
      contactTitle: 'Contact channels',
      contactBody: 'You can contact KidZcoop on Instagram or Facebook. We will reply as soon as we can.',
      instagram: 'Instagram',
      facebook: 'Facebook',
    },
  },
};

export function getStaticPageCopy(language: string, page: 'about' | 'contact') {
  return (pages[language] || pages.en)[page];
}
