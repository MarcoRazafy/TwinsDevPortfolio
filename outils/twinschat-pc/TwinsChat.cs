// Installateur et lanceur de TwinsChat pour Windows (compilé par build.ps1 avec le csc de .NET Framework 4,
// présent sur tout Windows 10/11 : aucun outil à installer).
//
// Premier lancement (fichier téléchargé) : copie dans %LOCALAPPDATA%\Programs\TwinsChat, raccourcis Bureau et
// menu Démarrer, entrée « Applications installées » (désinstallable), puis ouverture de TwinsChat.
// Lancements suivants : ouvre https://twinschat.ucan-mih.com/ dans sa propre fenêtre (mode application d'Edge,
// sans barre d'adresse). Aucun droit administrateur requis : tout reste dans le profil de l'utilisateur.

using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly: AssemblyTitle("TwinsChat")]
[assembly: AssemblyProduct("TwinsChat")]
[assembly: AssemblyCompany("TwinsDev")]
[assembly: AssemblyDescription("TwinsChat, la messagerie de TwinsDev")]
[assembly: AssemblyCopyright("TwinsDev")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

static class TwinsChat
{
    const string URL = "https://twinschat.ucan-mih.com/";
    // Page d'ouverture : retient que l'appli est installée (TwinsChat ne propose plus de la télécharger), puis ouvre TwinsChat
    const string LANCEMENT = URL + "appli-windows.html";
    const string NOM = "TwinsChat";
    const string VERSION = "1.0.0";
    const string CLE_DESINSTALLATION = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\TwinsChat";

    static string Dossier
    {
        get { return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", NOM); }
    }

    static string ExeInstalle
    {
        get { return Path.Combine(Dossier, "TwinsChat.exe"); }
    }

    static string RaccourciBureau
    {
        get { return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), NOM + ".lnk"); }
    }

    static string RaccourciMenu
    {
        get { return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), NOM + ".lnk"); }
    }

    [STAThread]
    static int Main(string[] args)
    {
        try
        {
            if (args.Length > 0 && args[0] == "/desinstaller")
            {
                Desinstaller();
                return 0;
            }

            string moi = Assembly.GetExecutingAssembly().Location;
            bool dejaInstalle = string.Equals(Path.GetFullPath(moi), Path.GetFullPath(ExeInstalle), StringComparison.OrdinalIgnoreCase);
            if (!dejaInstalle)
            {
                Installer(moi);
                MessageBox.Show(
                    "TwinsChat est installé.\n\nVous le retrouverez sur le Bureau et dans le menu Démarrer.",
                    NOM, MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            Lancer();
            return 0;
        }
        catch (Exception e)
        {
            MessageBox.Show("TwinsChat n'a pas pu démarrer : " + e.Message, NOM, MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }

    static void Installer(string source)
    {
        Directory.CreateDirectory(Dossier);
        File.Copy(source, ExeInstalle, true);

        Raccourci(RaccourciBureau);
        Directory.CreateDirectory(Path.GetDirectoryName(RaccourciMenu));
        Raccourci(RaccourciMenu);

        using (RegistryKey cle = Registry.CurrentUser.CreateSubKey(CLE_DESINSTALLATION))
        {
            cle.SetValue("DisplayName", NOM);
            cle.SetValue("DisplayVersion", VERSION);
            cle.SetValue("Publisher", "TwinsDev");
            cle.SetValue("DisplayIcon", ExeInstalle);
            cle.SetValue("InstallLocation", Dossier);
            cle.SetValue("URLInfoAbout", URL);
            cle.SetValue("UninstallString", "\"" + ExeInstalle + "\" /desinstaller");
            cle.SetValue("NoModify", 1, RegistryValueKind.DWord);
            cle.SetValue("NoRepair", 1, RegistryValueKind.DWord);
            cle.SetValue("EstimatedSize", (int)Math.Max(1, new FileInfo(ExeInstalle).Length / 1024), RegistryValueKind.DWord);
        }
    }

    static void Desinstaller()
    {
        DialogResult ok = MessageBox.Show("Désinstaller TwinsChat de cet ordinateur ?", NOM, MessageBoxButtons.YesNo, MessageBoxIcon.Question);
        if (ok != DialogResult.Yes) return;

        foreach (string lien in new[] { RaccourciBureau, RaccourciMenu })
        {
            if (File.Exists(lien)) File.Delete(lien);
        }
        Registry.CurrentUser.DeleteSubKeyTree(CLE_DESINSTALLATION, false);

        // Le programme ne peut pas s'effacer lui-même pendant qu'il tourne : une console cachée supprime
        // son dossier deux secondes après sa fermeture.
        ProcessStartInfo nettoyage = new ProcessStartInfo("cmd.exe", "/c ping 127.0.0.1 -n 3 > nul & rmdir /s /q \"" + Dossier + "\"");
        nettoyage.CreateNoWindow = true;
        nettoyage.UseShellExecute = false;
        Process.Start(nettoyage);
        MessageBox.Show("TwinsChat a été désinstallé.", NOM, MessageBoxButtons.OK, MessageBoxIcon.Information);
    }

    /// Ouvre TwinsChat dans une fenêtre d'application (Edge, sinon Chrome), ou à défaut dans le navigateur.
    static void Lancer()
    {
        string navigateur = Trouver("msedge.exe", @"Microsoft\Edge\Application\msedge.exe") ?? Trouver("chrome.exe", @"Google\Chrome\Application\chrome.exe");
        if (navigateur != null)
        {
            Process.Start(navigateur, "--app=" + LANCEMENT);
        }
        else
        {
            Process.Start(LANCEMENT);
        }
    }

    static string Trouver(string exe, string cheminRelatif)
    {
        foreach (RegistryKey racine in new[] { Registry.CurrentUser, Registry.LocalMachine })
        {
            using (RegistryKey cle = racine.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\App Paths\" + exe))
            {
                string chemin = cle == null ? null : cle.GetValue("") as string;
                if (!string.IsNullOrEmpty(chemin) && File.Exists(chemin)) return chemin;
            }
        }
        foreach (string variable in new[] { "ProgramFiles(x86)", "ProgramFiles", "LOCALAPPDATA" })
        {
            string racineProgrammes = Environment.GetEnvironmentVariable(variable);
            if (string.IsNullOrEmpty(racineProgrammes)) continue;
            string chemin = Path.Combine(racineProgrammes, cheminRelatif);
            if (File.Exists(chemin)) return chemin;
        }
        return null;
    }

    static void Raccourci(string chemin)
    {
        Type type = Type.GetTypeFromProgID("WScript.Shell");
        dynamic shell = Activator.CreateInstance(type);
        dynamic lien = shell.CreateShortcut(chemin);
        lien.TargetPath = ExeInstalle;
        lien.WorkingDirectory = Dossier;
        lien.IconLocation = ExeInstalle + ",0";
        lien.Description = "TwinsChat, la messagerie de TwinsDev";
        lien.Save();
    }
}
