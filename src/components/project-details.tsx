"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CircleDashed, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type StepStatus = "pending" | "in_progress" | "completed";

type Step = {
  name: string;
  status: StepStatus;
};

type Comment = {
  id: number;
  user: string;
  text: string;
  date: Date;
};

type Project = {
  id: number;
  clientName: string;
  stoneType: string;
  startDate: string;
  expectedEndDate: string;
  steps: Step[];
  comments: Comment[];
};

export function ProjectDetailsComponent({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null);
  // const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (id) {
      // Aqui você faria uma chamada à API para buscar os detalhes do projeto
      // Por enquanto, vamos simular com dados estáticos
      setProject({
        id: Number(id),
        clientName: "Cliente Exemplo",
        stoneType: "Mármore Exemplo",
        startDate: "2023-06-01",
        expectedEndDate: "2023-06-30",
        steps: [
          { name: "Corte", status: "completed" },
          { name: "Polimento", status: "in_progress" },
          { name: "Transporte", status: "pending" },
          { name: "Instalação", status: "pending" },
        ],
        comments: [
          {
            id: 1,
            user: "João",
            text: "Projeto iniciado conforme planejado.",
            date: new Date(2023, 5, 1, 9, 0),
          },
          {
            id: 2,
            user: "Maria",
            text: "Corte finalizado, iniciando polimento.",
            date: new Date(2023, 5, 5, 14, 30),
          },
        ],
      });
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    });
  };

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case "pending":
        return <CircleDashed className="text-gray-300 " />;
      case "in_progress":
        return <Clock className="text-yellow-500 " />;
      case "completed":
        return <CheckCircle className="text-green-500 " />;
    }
  };

  const getStatusText = (status: StepStatus) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "in_progress":
        return "Em andamento";
      case "completed":
        return "Concluído";
    }
  };

  // const handleCommentSubmit = () => {
  //   if (newComment.trim() && project) {
  //     const newCommentObj: Comment = {
  //       id: project.comments.length + 1,
  //       user: "Usuário Atual", // Idealmente, isso seria o nome do usuário logado
  //       text: newComment.trim(),
  //       date: new Date(),
  //     };
  //     setProject({
  //       ...project,
  //       comments: [...project.comments, newCommentObj],
  //     });
  //     setNewComment("");
  //   }
  // };

  if (!project) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto border">
        <CardHeader>
          <CardTitle>
            {project.clientName} - {project.stoneType}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <strong>Data de Início:</strong> {formatDate(project.startDate)}
            </div>
            <div>
              <strong>Previsão de Conclusão:</strong>{" "}
              {formatDate(project.expectedEndDate)}
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-4">Status do Projeto</h3>
          <div className="space-y-4">
            {project.steps.map((step, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="flex items-center">
                  {getStatusIcon(step.status)}
                  <span className="ml-2">{step.name}</span>
                </div>
                <Badge
                  variant={
                    step.status === "completed"
                      ? "success"
                      : step.status === "in_progress"
                      ? "warning"
                      : "outline"
                  }
                >
                  {getStatusText(step.status)}
                </Badge>
              </div>
            ))}
          </div>

          {/* <div className="mt-6 flex gap-2 items-center">
            <h2 className="text-lg font-semibold">Status Geral: </h2>
            <Badge
              variant={
                project.steps.every((step) => step.status === "completed")
                  ? "success"
                  : project.steps.some((step) => step.status === "in_progress")
                  ? "warning"
                  : "default"
              }
              className="text-lg"
            >
              {project.steps.every((step) => step.status === "completed")
                ? "Concluído"
                : "Em andamento"}
            </Badge>
          </div> */}

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Comentários</h3>
            <div className="space-y-4 mb-4">
              {project.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-zinc-900 border-zinc-800 border p-3 rounded-lg" // bg #202229  border #23252a bg root #090909
                >
                  <div className="flex justify-between items-start">
                    <strong>{comment.user}</strong>
                    <span className="text-sm">
                      {formatDistanceToNow(comment.date, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-400">{comment.text}</p>
                </div>
              ))}
            </div>
            {/* <div className="flex items-start space-x-2">
              <Textarea
                placeholder="Adicione um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-grow"
              />

              <Button
                onClick={handleCommentSubmit}
                disabled={!newComment.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </div> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
