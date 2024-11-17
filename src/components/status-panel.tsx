"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  Plus,
  Link,
  Clock,
  Slash,
  CircleDashed,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

// Tipos para nosso projeto
type StepStatus = "pending" | "in_progress" | "completed";

type Step = {
  name: string;
  status: StepStatus;
};

type LastUpdate = {
  user: string;
  action: string;
  date: Date;
};

type Project = {
  id: number;
  clientName: string;
  stoneType: string;
  startDate: string;
  expectedEndDate: string;
  steps: Step[];
  lastUpdate: LastUpdate;
};

// Componente principal
export function StatusPanelComponent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState<
    Omit<Project, "id" | "steps" | "lastUpdate">
  >({
    clientName: "",
    stoneType: "",
    startDate: "",
    expectedEndDate: "",
  });

  // Estado inicial com alguns projetos de exemplo
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      clientName: "João Silva",
      stoneType: "Mármore Carrara",
      startDate: "2024-06-01",
      expectedEndDate: "2024-06-15",
      steps: [
        { name: "Corte", status: "completed" },
        { name: "Polimento", status: "pending" },
        { name: "Transporte", status: "pending" },
        { name: "Instalação", status: "pending" },
      ],
      lastUpdate: {
        user: "Vagner",
        action: "marcou Corte como concluído",
        date: new Date(2024, 5, 2, 14, 30),
      },
    },
    {
      id: 2,
      clientName: "Maria Santos",
      stoneType: "Granito Preto São Gabriel",
      startDate: "2024-10-05",
      expectedEndDate: "2024-11-20",
      steps: [
        { name: "Corte", status: "completed" },
        { name: "Polimento", status: "completed" },
        { name: "Transporte", status: "in_progress" },
        { name: "Instalação", status: "pending" },
      ],
      lastUpdate: {
        user: "Ana",
        action: "marcou Polimento como concluído",
        date: new Date(2024, 10, 7, 11, 15),
      },
    },
  ]);

  // Função para atualizar o status de uma etapa
  const updateStepStatus = (
    projectId: number,
    stepIndex: number,
    newStatus: StepStatus
  ) => {
    const updatedProject = projects.map((project) => {
      if (project.id === projectId) {
        const newSteps = [...project.steps];
        const oldStatus = newSteps[stepIndex].status;

        // Se o novo status for 'in_progress' ou 'completed', verifique se todos os passos anteriores estão concluídos
        if (newStatus === "in_progress" || newStatus === "completed") {
          for (let i = 0; i < stepIndex; i++) {
            if (newSteps[i].status !== "completed") {
              // Se um passo anterior não estiver concluído, não permita a mudança
              toast({
                title: "Ação não permitida",
                description: `Não é possível marcar esta etapa como ${getStatusText(
                  newStatus
                )} porque etapas anteriores não estão concluídas.`,
                variant: "destructive",
              });

              return project; // Retorna o projeto sem alterações
            }
          }
        }

        newSteps[stepIndex].status = newStatus;

        // Se o novo status for 'pending', atualize todos os passos subsequentes para 'pending'
        if (newStatus === "pending") {
          for (let i = stepIndex + 1; i < newSteps.length; i++) {
            if (newSteps[i].status !== "pending") {
              newSteps[i].status = "pending";
            }
          }
        }

        return {
          ...project,
          steps: newSteps,
          lastUpdate: {
            user: "Usuário Atual", // Idealmente, isso seria o nome do usuário logado
            action: `alterou ${newSteps[stepIndex].name} de ${getStatusText(
              oldStatus
            )} para ${getStatusText(newStatus)}`,
            date: new Date(),
          },
        };
      }

      return project;
    });

    setProjects(updatedProject);
  };

  // Função para adicionar um novo projeto
  const addNewProject = () => {
    const newId = Math.max(...projects.map((p) => p.id)) + 1;
    setProjects([
      ...projects,
      {
        ...newProject,
        id: newId,
        steps: [
          { name: "Corte", status: "pending" },
          { name: "Polimento", status: "pending" },
          { name: "Transporte", status: "pending" },
          { name: "Instalação", status: "pending" },
        ],
        lastUpdate: {
          user: "Usuário Atual", // Idealmente, isso seria o nome do usuário logado
          action: "criou o projeto",
          date: new Date(),
        },
      },
    ]);
    setIsDialogOpen(false);
    setNewProject({
      clientName: "",
      stoneType: "",
      startDate: "",
      expectedEndDate: "",
    });
  };

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    });
  };

  // Função para copiar o link do projeto
  const copyProjectLink = (projectId: number) => {
    const link = `${window.location.origin}/projects/${projectId}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast({
          title: "Link copiado!",
          description:
            "O link do projeto foi copiado para a área de transferência.",
        });
      })
      .catch((err) => {
        console.error("Erro ao copiar link:", err);
        toast({
          title: "Erro ao copiar link",
          description: "Não foi possível copiar o link do projeto.",
          variant: "destructive",
        });
      });
  };

  // Função para obter o texto do status
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

  // Função para obter o ícone do status
  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case "pending":
        return <CircleDashed className="text-gray-400 " />;
      case "in_progress":
        return <Clock className="text-yellow-300 " />;
      case "completed":
        return <CheckCircle className="text-green-600 " />;
    }
  };

  return (
    <div className="min-h-screen container mx-auto max-w-5xl">
      <div className="min-h-screen">
        <nav className="p-4 flex justify-between items-center text-gray-400">
          <div className="flex items-center space-x-2">
            <span>Marmoraria</span>
            <Slash className="w-4 h-4" />
            <span>Projetos</span>
          </div>
        </nav>

        <div className="p-4">
          <div className="flex gap-2 justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              Painel de Status da Marmoraria
            </h1>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Novo Projeto
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Projeto</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="clientName" className="text-right">
                      Nome do Cliente
                    </Label>

                    <Input
                      id="clientName"
                      value={newProject.clientName}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          clientName: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stoneType" className="text-right">
                      Tipo de Pedra
                    </Label>

                    <Input
                      id="stoneType"
                      value={newProject.stoneType}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          stoneType: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startDate" className="text-right">
                      Data de Início
                    </Label>

                    <Input
                      id="startDate"
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          startDate: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expectedEndDate" className="text-right">
                      Previsão de Conclusão
                    </Label>
                    <Input
                      id="expectedEndDate"
                      type="date"
                      value={newProject.expectedEndDate}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          expectedEndDate: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>

                <Button onClick={addNewProject}>Adicionar Projeto</Button>
              </DialogContent>
            </Dialog>
          </div>

          {projects.map((project) => (
            <Card key={project.id} className="mb-4 ">
              <CardHeader>
                <div className="flex gap-4 justify-between items-center">
                  <CardTitle>
                    {project.clientName} - {project.stoneType}
                  </CardTitle>

                  <Button
                    variant="secondary"
                    onClick={() => copyProjectLink(project.id)}
                  >
                    <Link className="mr-2 h-4 w-4" />
                    <span>Copiar Link</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex gap-4 items-center justify-between mb-4">
                  <div>
                    <span className="font-semibold">Data de Início: </span>
                    {formatDate(project.startDate)}
                  </div>
                  <div>
                    <span className="font-semibold">
                      Previsão de Conclusão:{" "}
                    </span>
                    {formatDate(project.expectedEndDate)}
                  </div>
                </div>
                <div className="space-y-2">
                  {project.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              {getStatusIcon(step.status)}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              onSelect={() =>
                                updateStepStatus(project.id, index, "pending")
                              }
                            >
                              Pendente
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                updateStepStatus(
                                  project.id,
                                  index,
                                  "in_progress"
                                )
                              }
                            >
                              Em andamento
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                updateStepStatus(project.id, index, "completed")
                              }
                            >
                              Concluído
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                <div className="mt-4 flex flex-col gap-2 justify-between sm:gap-0 sm:flex-row sm:items-center">
                  <Badge
                    className="w-fit"
                    variant={
                      project.steps.every((step) => step.status === "completed")
                        ? "outline"
                        : "warning"
                    }
                  >
                    {project.steps.every((step) => step.status === "completed")
                      ? "Concluído"
                      : "Em andamento"}
                  </Badge>

                  <div className="text-sm text-muted-foreground">
                    <i>
                      <b>{project.lastUpdate.user}</b>{" "}
                      {project.lastUpdate.action}{" "}
                      {formatDistanceToNow(project.lastUpdate.date, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </i>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
