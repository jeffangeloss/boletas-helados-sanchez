"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { loginWithPin } from "@/app/actions/auth";
import { NumberPad } from "@/components/pos/number-pad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type LoginClientProps = {
  nextPath: string;
};

export default function LoginClient({ nextPath }: LoginClientProps) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await loginWithPin(pin);
      if (!result.ok) {
        setMessage(result.message ?? "PIN incorrecto.");
        setPin("");
        return;
      }
      router.replace(nextPath);
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md pos-shadow">
        <CardHeader>
          <CardTitle className="font-display text-3xl">Ingresa tu PIN</CardTitle>
          <p className="text-sm text-muted-foreground">
            Operadores y admin usan su PIN de 4 a 6 dígitos.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl bg-white/80 px-4 py-3 text-center text-2xl tracking-[0.4em]">
            {pin.padEnd(4, "*")}
          </div>
          {message ? (
            <div className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-700">
              {message}
            </div>
          ) : null}
          <NumberPad
            value={pin}
            onChange={setPin}
            onSubmit={handleSubmit}
            maxLength={6}
          />
          <Button
            className="w-full h-12 text-base"
            onClick={handleSubmit}
            disabled={pin.length < 4 || isPending}
          >
            Entrar
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

