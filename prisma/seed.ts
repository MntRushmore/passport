await prisma.workshop.createMany({
  data: [
    {
      id: 1,
      title: "Glaze",
      emoji: "🍩",
      description: "Create a delicious donut-themed web app...",
      completed: false,
      submissionDate: null,
      clubCode: "global",
    },
    {
      id: 2,
      title: "Grub",
      emoji: "🍟",
      description: "Build a fast food ordering system...",
      completed: false,
      submissionDate: null,
      clubCode: "global",
    },
    // Add others...
  ],
});