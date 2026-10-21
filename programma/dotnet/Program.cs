using System;

Console.WriteLine("C# / .NET-test");
Console.WriteLine(new string('-', 30));
Console.WriteLine($".NET-versie: {Environment.Version}");
Console.WriteLine($"Systeem: {Environment.OSVersion}");

int resultaat = 0;
for (int i = 1; i <= 10; i++) resultaat += i;

if (resultaat != 55)
    throw new Exception("Rekentest mislukt");

Console.WriteLine($"Rekentest (som 1 t/m 10 = {resultaat}): OK");
Console.WriteLine(new string('-', 30));
Console.WriteLine("Alle C#-tests geslaagd ✔");